#!/usr/bin/env node
/**
 * PostToolUse hook for Skill tool.
 *
 * Reads Claude Code's stdin JSON payload, parses the session transcript
 * to extract token/duration metrics, and POSTs the skill event to the
 * CLIProxy collector endpoint.
 *
 * Zero external dependencies — uses only Node.js built-ins.
 *
 * Environment:
 *   CLIPROXY_COLLECTOR_URL — full endpoint URL
 *     default: http://localhost:8417/api/collector/skill-events
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

// ── Helpers ──────────────────────────────────────────────

/** Deterministic int hash from a string (for sqlite_id). */
function hashInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Parse a Claude Code transcript JSONL to extract metrics.
 *
 * The transcript is a newline-delimited JSON file where each line is
 * a message object.  We scan for `usage` blocks (token counts) and
 * `tool_use` content blocks (tool call count).
 *
 * To attribute metrics to the *current* skill call (not the whole
 * session), we look backwards from the end and stop at the previous
 * assistant turn boundary — giving us approximate per-turn metrics.
 */
function parseTranscriptMetrics(transcriptPath) {
  const defaults = {
    inputTokens: 0,
    outputTokens: 0,
    toolCalls: 0,
    durationMs: 0,
    model: null,
  };

  if (!transcriptPath) return defaults;

  let raw;
  try {
    raw = readFileSync(transcriptPath, 'utf-8');
  } catch {
    return defaults;
  }

  const lines = raw.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return defaults;

  // Parse all entries (cheap — transcripts are usually < 1 MB)
  const entries = [];
  for (const line of lines) {
    try { entries.push(JSON.parse(line)); } catch { /* skip */ }
  }

  // Walk backwards to find the last two assistant messages.
  // Everything between them approximates the current skill turn.
  let lastAssistantIdx = -1;
  let prevAssistantIdx = -1;

  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    const role = e.role || e.type;
    if (role === 'assistant') {
      if (lastAssistantIdx === -1) {
        lastAssistantIdx = i;
      } else {
        prevAssistantIdx = i;
        break;
      }
    }
  }

  // If we can't isolate a turn, fall back to the last entry only
  const startIdx = prevAssistantIdx >= 0 ? prevAssistantIdx + 1 : Math.max(0, entries.length - 5);

  let inputTokens = 0;
  let outputTokens = 0;
  let toolCalls = 0;
  let model = null;
  let firstTs = null;
  let lastTs = null;

  for (let i = startIdx; i < entries.length; i++) {
    const entry = entries[i];

    // Timestamps
    const ts = entry.timestamp || entry.createdAt || entry.created_at;
    if (ts) {
      const t = new Date(ts).getTime();
      if (!isNaN(t)) {
        if (firstTs === null || t < firstTs) firstTs = t;
        if (lastTs === null || t > lastTs) lastTs = t;
      }
    }

    // Model
    if (entry.model && typeof entry.model === 'string') model = entry.model;

    // Token usage
    const usage = entry.usage || entry.message?.usage;
    if (usage) {
      if (usage.input_tokens) inputTokens += usage.input_tokens;
      if (usage.output_tokens) outputTokens += usage.output_tokens;
    }

    // Tool calls — from content blocks
    const content = entry.content || entry.message?.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block.type === 'tool_use') toolCalls++;
      }
    }
  }

  const durationMs = (firstTs && lastTs) ? lastTs - firstTs : 0;

  return { inputTokens, outputTokens, toolCalls, durationMs, model };
}

function sha1(value) {
  return createHash('sha1').update(String(value)).digest('hex');
}

function pickFirstInt(sources, keys) {
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue;
    for (const key of keys) {
      const raw = src[key];
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
  }
  return 0;
}

function pickFirstString(sources, keys) {
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue;
    for (const key of keys) {
      const value = src[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }
  return null;
}

function extractEventMetrics(payload, transcriptMetrics) {
  const toolResponse = payload?.tool_response;
  const message = payload?.message;
  const usage = payload?.usage;
  const result = toolResponse?.result;

  const sources = [
    payload,
    toolResponse,
    result,
    usage,
    message,
    message?.usage,
    toolResponse?.usage,
    toolResponse?.message,
    toolResponse?.message?.usage,
  ];

  const inputTokens = pickFirstInt(sources, ['input_tokens', 'inputTokens', 'tokens_used']);
  const outputTokens = pickFirstInt(sources, ['output_tokens', 'outputTokens']);
  const toolCalls = pickFirstInt(sources, ['tool_calls', 'toolCalls']);
  const durationMs = pickFirstInt(sources, ['duration_ms', 'durationMs', 'elapsed_ms', 'elapsedMs']);
  const model = pickFirstString(sources, ['model']) || transcriptMetrics.model;

  return {
    inputTokens: inputTokens || transcriptMetrics.inputTokens || 0,
    outputTokens: outputTokens || transcriptMetrics.outputTokens || 0,
    toolCalls: toolCalls || transcriptMetrics.toolCalls || 0,
    durationMs: durationMs || transcriptMetrics.durationMs || 0,
    model,
  };
}

/**
 * POST events to the collector.  Fire-and-forget with a timeout.
 */
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
          res.resume(); // drain
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

// ── Main ─────────────────────────────────────────────────

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { return; }
  if (!data || typeof data !== 'object') return;

  const toolInput = data.tool_input || {};
  const skillName = String(toolInput.skill || '').trim();
  const sessionId = String(data.session_id || '').trim();

  if (!skillName || !sessionId) return;

  // Derive project name from cwd (last directory component)
  const cwd = String(data.cwd || '').trim();
  const projectDir = cwd ? basename(cwd) : '';

  // Parse transcript for metrics and merge with hook payload metrics
  const transcriptMetrics = parseTranscriptMetrics(data.transcript_path);
  const metrics = extractEventMetrics(data, transcriptMetrics);

  const statusRaw = String(
    data?.tool_response?.status
    || data?.status
    || data?.tool_response?.result?.status
    || ''
  ).toLowerCase();
  const status = statusRaw === 'failure' || statusRaw === 'error' ? 'failure' : 'success';

  const errorType = String(
    data?.tool_response?.error_type
    || data?.tool_response?.error?.type
    || data?.tool_response?.result?.error_type
    || ''
  ).trim() || null;

  const errorMessage = String(
    data?.tool_response?.error_message
    || data?.tool_response?.error?.message
    || data?.tool_response?.result?.error_message
    || data?.tool_response?.stderr
    || ''
  ).trim() || null;

  const attemptNoRaw = Number(
    data?.attempt_no
    || data?.tool_response?.attempt_no
    || data?.tool_response?.result?.attempt_no
    || 1
  );
  const attemptNo = Number.isFinite(attemptNoRaw) && attemptNoRaw > 0 ? Math.floor(attemptNoRaw) : 1;

  const toolUseId = String(data.tool_use_id || '').trim() || null;
  const triggeredAt = new Date().toISOString();
  const eventUidBase = [
    MACHINE_ID,
    sessionId,
    skillName,
    toolUseId || '',
    String(attemptNo),
  ].join('|');

  const event = {
    event_uid: sha1(eventUidBase),
    tool_use_id: toolUseId,
    machine_id: MACHINE_ID,
    source: 'plugin',
    sqlite_id: hashInt(toolUseId || `${sessionId}-${skillName}-${triggeredAt}`),
    skill_name: skillName,
    session_id: sessionId,
    trigger_type: 'explicit',
    triggered_at: triggeredAt,
    status,
    error_type: errorType,
    error_message: errorMessage,
    attempt_no: attemptNo,
    arguments: toolInput.args || null,
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
