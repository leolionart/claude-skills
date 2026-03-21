#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { request as httpsRequest } from 'node:https';
import { basename } from 'node:path';

const BOT_TOKEN = process.env.CC_TELEGRAM_ALERT_BOT_TOKEN;
const CHAT_ID = process.env.CC_TELEGRAM_ALERT_CHAT_ID;
const ALERT_PREFIX = process.env.CC_TELEGRAM_ALERT_PREFIX || 'Claude Code needs approval';
const NOTIFY_ON = process.env.CC_TELEGRAM_ALERT_NOTIFY_ON || 'permission-request';
const REQUEST_TIMEOUT_MS = 5000;

function sha1(value) {
  return createHash('sha1').update(String(value)).digest('hex');
}

function parseInput(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function summarizeToolInput(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return 'No tool input details sent.';

  const keys = Object.keys(toolInput).filter(Boolean).slice(0, 6);
  return keys.length > 0
    ? `Input keys: ${keys.join(', ')}`
    : 'No tool input details sent.';
}

function formatMessage(payload) {
  const hookEventName = trimString(payload.hook_event_name) || 'PermissionRequest';
  const toolName = trimString(payload.tool_name) || trimString(payload.notification_type) || 'unknown-tool';
  const cwd = trimString(payload.cwd);
  const projectName = cwd ? basename(cwd) : 'unknown-project';
  const sessionId = trimString(payload.session_id) || 'unknown-session';
  const permissionMode = trimString(payload.permission_mode) || 'unknown';
  const decision = trimString(payload.permission_decision) || 'waiting';
  const timestamp = trimString(payload.timestamp) || new Date().toISOString();
  const toolSummary = summarizeToolInput(payload.tool_input);
  const eventFingerprint = sha1([
    hookEventName,
    toolName,
    cwd,
    sessionId,
    timestamp,
    JSON.stringify(payload.tool_input || {})
  ].join('|')).slice(0, 12);

  return [
    `<b>${escapeHtml(ALERT_PREFIX)}</b>`,
    '',
    `<b>Event</b>: ${escapeHtml(hookEventName)}`,
    `<b>Tool</b>: <code>${escapeHtml(toolName)}</code>`,
    `<b>Project</b>: <code>${escapeHtml(projectName)}</code>`,
    `<b>Session</b>: <code>${escapeHtml(sessionId)}</code>`,
    `<b>Mode</b>: <code>${escapeHtml(permissionMode)}</code>`,
    `<b>Status</b>: ${escapeHtml(decision)}`,
    `<b>Notify mode</b>: <code>${escapeHtml(NOTIFY_ON)}</code>`,
    `<b>When</b>: <code>${escapeHtml(timestamp)}</code>`,
    `<b>Request</b>: <code>${escapeHtml(toolSummary)}</code>`,
    `<b>Fingerprint</b>: <code>${escapeHtml(eventFingerprint)}</code>`
  ].join('\n');
}

function sendTelegramMessage(text) {
  return new Promise((resolve) => {
    if (!BOT_TOKEN || !CHAT_ID) {
      resolve();
      return;
    }

    const body = JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    const req = httpsRequest(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        res.resume();
        resolve();
      },
    );

    req.on('error', () => resolve());
    req.on('timeout', () => {
      req.destroy();
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  const payload = parseInput(input);
  if (!payload) return;

  const text = formatMessage(payload);
  await sendTelegramMessage(text);
}

main().catch(() => process.exit(0));
