---
name: mcp-to-cli
description: Generate standalone CLIs or make one-off tool calls from MCP servers using mcporter. Use when the user wants to convert an MCP into a compiled CLI, inspect available MCP tools, import MCP definitions from Claude Code/Cursor/Codex, authenticate remote HTTP MCPs, or call MCP tools without registering the server in Claude Code.
version: 1.0.0
category: automation
updated: 2026-03-18
---

# MCP to CLI

## Purpose
- Use `mcporter` to either:
  - call an MCP tool outside Claude Code, or
  - generate a reusable compiled CLI with `--runtime bun --compile`.
- Prefer this skill when the user wants MCP → CLI, not a new Claude Code skill.
- This is especially useful when the user does not want to register the MCP in Claude Code because MCP tool definitions consume context.

## Inputs to Collect
- MCP source type: `claude`, `cursor`, `codex`, `stdio command`, or `HTTP MCP URL`
- Output mode: one-off call or reusable CLI
- Server name / import filter
- Whether remote auth is required
- Target CLI name and output path
- Optional validation tool name and arguments

## Prerequisites
- `node` / `npx`
- `bun` if the output should be a compiled standalone binary
- A safe place for generated artifacts, typically `config/mcporter.json` and `bin/<name>`

## Decision Table

| Situation | Command path |
| --- | --- |
| Inspect an MCP before doing anything else | `npx -y mcporter list ...` |
| One-off use only | `npx -y mcporter call ...` |
| Repeated use / reusable CLI | `npx -y mcporter generate-cli ... --runtime bun --compile ...` |
| MCP already defined in Claude Code / Cursor / Codex | `npx -y mcporter config import <source> --copy --filter <server>` |
| MCP known only by stdio command | `npx -y mcporter generate-cli --command "<stdio command>" ...` |
| MCP exposed as streamable HTTP | `npx -y mcporter generate-cli --command https://.../mcp ...` |
| Remote MCP requires OAuth / auth bootstrap | `npx -y mcporter auth <server-or-url>` before `list`, `call`, or `generate-cli` |

## Process Steps

1. **Identify the source and desired output mode**
   - Decide whether the MCP comes from editor config, a raw stdio command, or an HTTP endpoint.
   - Decide whether the user wants:
     - a one-off tool call, or
     - a reusable compiled CLI.

2. **Import or define the MCP source**
   - Import from editor-managed config:
   ```bash
   npx -y mcporter config import claude --copy --filter <server>
   npx -y mcporter config import cursor --copy --filter <server>
   npx -y mcporter config import codex --copy --filter <server>
   ```
   - These imports write local config to `config/mcporter.json`.
   - If the MCP is not already registered, use the source directly:
   ```bash
   # stdio MCP
   npx -y mcporter generate-cli --command "<stdio command>" --runtime bun --compile ./bin/<name>

   # HTTP MCP
   npx -y mcporter generate-cli --command https://example.com/mcp --runtime bun --compile ./bin/<name>
   ```

3. **Inspect available tools**
   ```bash
   # Imported / named MCP
   npx -y mcporter list <server> --config ./config/mcporter.json

   # Raw stdio MCP
   npx -y mcporter list --stdio "<stdio command>"

   # Raw HTTP MCP
   npx -y mcporter list https://example.com/mcp
   ```

4. **Authenticate if needed**
   - For remote MCPs that require OAuth or auth bootstrap:
   ```bash
   npx -y mcporter auth https://example.com/mcp
   npx -y mcporter auth <server>
   ```
   - Complete auth before `call` or `generate-cli`.

5. **Optionally validate with a one-off call**
   ```bash
   # Imported / named MCP
   npx -y mcporter call <server>.<tool> --config ./config/mcporter.json key=value

   # Raw stdio MCP
   npx -y mcporter call --stdio "<stdio command>" <tool> key=value

   # Raw HTTP MCP
   npx -y mcporter call --http-url https://example.com/mcp <tool> key=value
   ```
   - Use this when the user wants proof that the tool works before generating a binary.

6. **Generate the standalone CLI**
   ```bash
   # Imported / named MCP
   npx -y mcporter generate-cli \
     --server <server> \
     --config ./config/mcporter.json \
     --runtime bun \
     --compile ./bin/<name>

   # Raw stdio or HTTP MCP
   npx -y mcporter generate-cli \
     --command "<stdio command or https://example.com/mcp>" \
     --runtime bun \
     --compile ./bin/<name>
   ```
   - Prefer `--runtime bun --compile` for a true standalone executable.

7. **Report artifacts and usage**
   - Return:
     - chosen source type,
     - artifact paths such as `config/mcporter.json` and `bin/<name>`,
     - one or two example invocations,
     - any auth prerequisite,
     - a warning about embedded secrets.

## Recommended File Layout

```text
config/
  mcporter.json
bin/
  <name>
```

## Security / Guardrails
- Generated configs, TypeScript, and compiled binaries may embed headers, tokens, command args, or other secrets.
- Prefer environment variables in the source config or launch command instead of hardcoding secrets.
- Do not commit generated artifacts or config files that contain credentials.
- If importing from Claude Code / Cursor / Codex, review the copied definition before sharing or publishing it.
- If auth is required, confirm whether the user wants a local interactive login flow before proceeding.

## Examples

### 1. Import from Claude Code config and generate a CLI
```bash
npx -y mcporter config import claude --copy --filter mcp-atlassian
npx -y mcporter list mcp-atlassian --config ./config/mcporter.json
npx -y mcporter generate-cli \
  --server mcp-atlassian \
  --config ./config/mcporter.json \
  --runtime bun \
  --compile ./bin/mcp-atlassian
./bin/mcp-atlassian --help
```

### 2. One-off call without generating a CLI
```bash
npx -y mcporter call mcp-atlassian.jira_search \
  --config ./config/mcporter.json \
  jql='text ~ "automation"' \
  limit=10
```

### 3. Generate directly from a stdio command
```bash
npx -y mcporter list --stdio "npx -y chrome-devtools-mcp@latest"
npx -y mcporter generate-cli \
  --command "npx -y chrome-devtools-mcp@latest" \
  --runtime bun \
  --compile ./bin/chrome-devtools
./bin/chrome-devtools --help
```

### 4. Generate directly from a streamable HTTP MCP
```bash
npx -y mcporter list https://mcp.example.com/mcp
npx -y mcporter generate-cli \
  --command https://mcp.example.com/mcp \
  --runtime bun \
  --compile ./bin/example-mcp
./bin/example-mcp --help
```

### 5. Authenticate a remote MCP before calling or generating
```bash
npx -y mcporter auth https://mcp.example.com/mcp
npx -y mcporter call --http-url https://mcp.example.com/mcp some_tool argA=value
npx -y mcporter generate-cli \
  --command https://mcp.example.com/mcp \
  --runtime bun \
  --compile ./bin/my-mcp
```

## Quality Gates
- `mcporter list` resolves the expected tools for the chosen source.
- If a one-off validation call was requested, `mcporter call` succeeds before generation.
- Generated binary responds to `./bin/<name> --help`.
- Final response includes artifact path(s), example usage, and an explicit secret-handling warning.
- If the user only wants a one-off call, skip CLI generation and state that no build artifact was created.
