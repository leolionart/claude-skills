#!/usr/bin/env node
/**
 * Stop hook for Skill telemetry (Phase 2: final enrichment).
 *
 * On Stop, transcript usually contains the completed skill execution turn.
 * This script finds the latest Skill tool call in current session, rebuilds
 * the same event identity, then sends an enriched final payload.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { hostname } from 'node:os';
import { basename } from 'node:path';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

const COLLECTOR_URL = process.env.CLIPROXY_COLLECTOR_URL
  || 'http://localhost:8417/api/collector/skill-events';

const MACHINE_ID = hostname();

function hashInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function sha1(value) {
  return createHash('sha1').update(String(value)).digest('hex');
}

function toIsoOrNow(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return new Date().toISOString();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function normalizeStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === 'failure' || raw === 'error' ? 'failure' : 'success';
}

function pickEntryTimestamp(entry) {
  return (
    entry?.timestamp
    || entry?.createdAt
    || entry?.created_at
    || entry?.message?.timestamp
    || entry?.message?.createdAt
    || entry?.message?.created_at
    || null
  );
}

function readTranscriptEntries(transcriptPath) {
  if (!transcriptPath) return [];

  let raw;
  try {
    raw = readFileSync(transcriptPath, 'utf-8');
  } catch {
    return [];
  }

  const lines = raw.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return [];

  const entries = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // ignore malformed line
    }
  }

  return entries;
}

function getContentBlocks(entry) {
  const content = entry?.content || entry?.message?.content;
  return Array.isArray(content) ? content : [];
}

function extractSkillCalls(entries) {
  const calls = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const role = entry?.role || entry?.type;
    if (role !== 'assistant') continue;

    const blocks = getContentBlocks(entry);
    for (const block of blocks) {
      if (block?.type !== 'tool_use') continue;
      if (String(block?.name || '').trim() !== 'Skill') continue;

      const input = block?.input && typeof block.input === 'object' ? block.input : {};
      const skillName = String(input.skill || '').trim();
      if (!skillName) continue;

      const attemptNoRaw = Number(
        input.attempt_no
        || input.attemptNo
        || 1
      );
      const attemptNo = Number.isFinite(attemptNoRaw) && attemptNoRaw > 0 ? Math.floor(attemptNoRaw) : 1;

      calls.push({
        idx: i,
        timestamp: pickEntryTimestamp(entry),
        toolUseId: String(block?.id || '').trim() || null,
        skillName,
        attemptNo,
        args: input.args ?? null,
      });
    }
  }

  return calls;
}

function findExecutionWindow(entries, callIdx) {
  let executionAssistantIdx = -1;
  for (let i = callIdx + 1; i < entries.length; i++) {
    const role = entries[i]?.role || entries[i]?.type;
    if (role === 'assistant') {
      executionAssistantIdx = i;
      break;
    }
  }

  if (executionAssistantIdx === -1) {
    return { start: callIdx, endExclusive: entries.length };
  }

  let nextAssistantIdx = entries.length;
  for (let i = executionAssistantIdx + 1; i < entries.length; i++) {
    const role = entries[i]?.role || entries[i]?.type;
    if (role === 'assistant') {
      nextAssistantIdx = i;
      break;
    }
  }

  return { start: executionAssistantIdx, endExclusive: nextAssistantIdx };
}

function extractMetricsFromWindow(entries, start, endExclusive) {
  let inputTokens = 0;
  let outputTokens = 0;
  let toolCalls = 0;
  let model = null;
  let firstTs = null;
  let lastTs = null;

  for (let i = start; i < endExclusive; i++) {
    const entry = entries[i];

    const ts = pickEntryTimestamp(entry);
    if (ts) {
      const t = new Date(ts).getTime();
      if (!Number.isNaN(t)) {
        if (firstTs === null || t < firstTs) firstTs = t;
        if (lastTs === null || t > lastTs) lastTs = t;
      }
    }

    const entryModel = entry?.message?.model || entry?.model;
    if (typeof entryModel === 'string' && entryModel.trim()) model = entryModel.trim();

    const usage = entry?.usage || entry?.message?.usage;
    if (usage) {
      const inTok = Number(usage.input_tokens || usage.inputTokens || 0);
      const outTok = Number(usage.output_tokens || usage.outputTokens || 0);
      if (Number.isFinite(inTok) && inTok > 0) inputTokens += Math.floor(inTok);
      if (Number.isFinite(outTok) && outTok > 0) outputTokens += Math.floor(outTok);
    }

    const blocks = getContentBlocks(entry);
    for (const block of blocks) {
      if (block?.type === 'tool_use') toolCalls++;
    }
  }

  const durationMs = (firstTs !== null && lastTs !== null && lastTs >= firstTs)
    ? (lastTs - firstTs)
    : 0;

  return {
    inputTokens,
    outputTokens,
    toolCalls,
    durationMs,
    model,
  };
}

function extractStatusAndError(entries, start, endExclusive) {
  let status = 'success';
  let errorType = null;
  let errorMessage = null;

  for (let i = start; i < endExclusive; i++) {
    const entry = entries[i];
    const blocks = getContentBlocks(entry);

    for (const block of blocks) {
      if (block?.type !== 'tool_result') continue;

      const isError = Boolean(block?.is_error);
      if (isError) status = 'failure';

      if (!errorMessage) {
        const text = typeof block?.content === 'string'
          ? block.content
          : typeof block?.text === 'string'
            ? block.text
            : null;
        if (text && text.trim()) errorMessage = text.trim().slice(0, 1000);
      }

      if (!errorType && isError) {
        errorType = 'tool_result_error';
      }
    }
  }

  return { status, errorType, errorMessage };
}

function postEvents(events) {
  return new Promise((resolve) => {
    try {
      const url = new URL(COLLECTOR_URL);
      const body = JSON.stringify({ events });
      const doRequest = url.protocol === 'https:' ? httpsRequest : httpRequest;

      const req = doRequest(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          timeout: 5000,
        },
        (res) => {
          res.resume();
          resolve();
        },
      );

      req.on('error', () => resolve());
      req.on('timeout', () => { req.destroy(); resolve(); });
      req.write(body);
      req.end();
    } catch {
      resolve();
    }
  });
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    return;
  }
  if (!data || typeof data !== 'object') return;

  const sessionId = String(data.session_id || '').trim();
  if (!sessionId) return;

  const entries = readTranscriptEntries(data.transcript_path);
  if (!entries.length) return;

  const skillCalls = extractSkillCalls(entries);
  if (!skillCalls.length) return;

  const latestCall = skillCalls[skillCalls.length - 1];
  const { start, endExclusive } = findExecutionWindow(entries, latestCall.idx);

  const metrics = extractMetricsFromWindow(entries, start, endExclusive);
  const windowStatus = extractStatusAndError(entries, start, endExclusive);

  const cwd = String(data.cwd || '').trim();
  const projectDir = cwd ? basename(cwd) : '';

  const triggeredAt = toIsoOrNow(latestCall.timestamp || data.timestamp || data.created_at || data.createdAt);
  const eventUidBase = [
    MACHINE_ID,
    sessionId,
    latestCall.skillName,
    latestCall.toolUseId || '',
    String(latestCall.attemptNo),
  ].join('|');

  const status = normalizeStatus(data.status || windowStatus.status);
  const errorType = String(data.error_type || windowStatus.errorType || '').trim() || null;
  const errorMessage = String(data.error_message || windowStatus.errorMessage || '').trim() || null;

  const event = {
    event_uid: sha1(eventUidBase),
    tool_use_id: latestCall.toolUseId,
    machine_id: MACHINE_ID,
    source: 'plugin',
    sqlite_id: hashInt(latestCall.toolUseId || `${sessionId}-${latestCall.skillName}-${triggeredAt}`),
    skill_name: latestCall.skillName,
    session_id: sessionId,
    trigger_type: 'explicit',
    triggered_at: triggeredAt,
    status,
    error_type: errorType,
    error_message: errorMessage,
    attempt_no: latestCall.attemptNo,
    arguments: latestCall.args,
    tokens_used: metrics.inputTokens,
    output_tokens: metrics.outputTokens,
    tool_calls: metrics.toolCalls,
    duration_ms: metrics.durationMs,
    model: metrics.model,
    is_skeleton: false,
    project_dir: projectDir,
  };

  await postEvents([event]);
}

main().catch(() => process.exit(0));
