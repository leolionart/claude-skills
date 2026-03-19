#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_MCP_PATH="$ROOT_DIR/.mcp.json"
CONFIG_DIR="$ROOT_DIR/config"
CONFIG_PATH="$CONFIG_DIR/mcporter.json"
BIN_DIR="$ROOT_DIR/scripts"
SERVER_NAME="${ATLASSIAN_MCP_SERVER:-mcp-atlassian}"
GENERATED_BIN="$BIN_DIR/mcp-atlassian"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

for cmd in node npx bun; do
  require_cmd "$cmd"
done

if [[ ! -f "$PROJECT_MCP_PATH" ]]; then
  echo "Project MCP config not found: $PROJECT_MCP_PATH" >&2
  exit 1
fi

mkdir -p "$CONFIG_DIR" "$BIN_DIR"

echo "Importing $SERVER_NAME from $PROJECT_MCP_PATH"
npx -y mcporter config import claude \
  --path "$PROJECT_MCP_PATH" \
  --filter "$SERVER_NAME" \
  --copy >/dev/null

echo "Validating imported server"
npx -y mcporter list "$SERVER_NAME" --config "$CONFIG_PATH" >/dev/null

echo "Generating compiled CLI binary"
rm -f "$GENERATED_BIN"
npx -y mcporter generate-cli \
  --server "$SERVER_NAME" \
  --config "$CONFIG_PATH" \
  --runtime bun \
  --compile "$GENERATED_BIN" >/dev/null

cat >"$BIN_DIR/jira-mcp" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY="$SCRIPT_DIR/mcp-atlassian"
DEFAULT_FIELDS="${ATLASSIAN_JIRA_LEAN_FIELDS:-summary,status,assignee,priority,issuetype,updated}"
COMPACT_JSON="${ATLASSIAN_CLI_COMPACT_JSON:-1}"
LEAN="${ATLASSIAN_CLI_LEAN:-1}"
VERBOSE="${ATLASSIAN_CLI_VERBOSE:-0}"

usage() {
  cat <<'USAGE'
Usage: scripts/jira-mcp <jira-subcommand> [args]

Wrapper over scripts/mcp-atlassian for Jira commands.

Wrapper-only flags:
  --output json    Keep compatibility with existing skill docs. When jq is available,
                   output is compacted to one-line JSON.

Examples:
  scripts/jira-mcp jira-search --jql "project = AI" --limit 5 --output json
  scripts/jira-mcp jira-get-issue --issue-key "AI-123" --fields "summary,status" --output json
USAGE
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

case "$1" in
  -h|--help)
    usage
    exit 0
    ;;
esac

if [[ ! -x "$BINARY" ]]; then
  echo "Missing compiled CLI: $BINARY" >&2
  echo "Run ./scripts/generate_atlassian_clis.sh first." >&2
  exit 1
fi

subcommand="$1"
shift

args=()
output_mode=""
has_fields=0
has_raw=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      [[ $# -lt 2 ]] && { echo "Missing value for --output" >&2; exit 1; }
      output_mode="$2"
      shift 2
      ;;
    --fields)
      has_fields=1
      args+=("$1")
      [[ $# -lt 2 ]] && { echo "Missing value for --fields" >&2; exit 1; }
      args+=("$2")
      shift 2
      ;;
    --raw)
      has_raw=1
      args+=("$1")
      [[ $# -lt 2 ]] && { echo "Missing value for --raw" >&2; exit 1; }
      args+=("$2")
      shift 2
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

if [[ "$LEAN" != "0" && "$has_fields" == "0" && "$has_raw" == "0" ]]; then
  case "$subcommand" in
    jira-search|jira-get-issue|jira-get-board-issues)
      args+=("--fields" "$DEFAULT_FIELDS")
      ;;
  esac
fi

set +e
if [[ "$VERBOSE" == "1" ]]; then
  raw_output="$("$BINARY" "$subcommand" "${args[@]}")"
else
  raw_output="$("$BINARY" "$subcommand" "${args[@]}" 2>/dev/null)"
fi
status=$?
set -e

if [[ $status -ne 0 ]]; then
  printf '%s\n' "$raw_output" >&2
  exit $status
fi

if [[ "$output_mode" == "json" && "$COMPACT_JSON" != "0" ]] && command -v jq >/dev/null 2>&1; then
  if printf '%s\n' "$raw_output" | jq -c . >/dev/null 2>&1; then
    printf '%s\n' "$raw_output" | jq -c .
    exit 0
  fi
fi

printf '%s\n' "$raw_output"
EOF

cat >"$BIN_DIR/confluence-mcp" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY="$SCRIPT_DIR/mcp-atlassian"
COMPACT_JSON="${ATLASSIAN_CLI_COMPACT_JSON:-1}"
VERBOSE="${ATLASSIAN_CLI_VERBOSE:-0}"

usage() {
  cat <<'USAGE'
Usage: scripts/confluence-mcp <confluence-subcommand> [args]

Wrapper over scripts/mcp-atlassian for Confluence commands.

Wrapper-only flags:
  --output json    Keep compatibility with existing skill docs. When jq is available,
                   output is compacted to one-line JSON.

Examples:
  scripts/confluence-mcp confluence-search --query 'type=page AND space=BD' --limit 5 --output json
  scripts/confluence-mcp confluence-get-page --page-id '123456' --output json
USAGE
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

case "$1" in
  -h|--help)
    usage
    exit 0
    ;;
esac

if [[ ! -x "$BINARY" ]]; then
  echo "Missing compiled CLI: $BINARY" >&2
  echo "Run ./scripts/generate_atlassian_clis.sh first." >&2
  exit 1
fi

subcommand="$1"
shift

args=()
output_mode=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      [[ $# -lt 2 ]] && { echo "Missing value for --output" >&2; exit 1; }
      output_mode="$2"
      shift 2
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

set +e
if [[ "$VERBOSE" == "1" ]]; then
  raw_output="$("$BINARY" "$subcommand" "${args[@]}")"
else
  raw_output="$("$BINARY" "$subcommand" "${args[@]}" 2>/dev/null)"
fi
status=$?
set -e

if [[ $status -ne 0 ]]; then
  printf '%s\n' "$raw_output" >&2
  exit $status
fi

if [[ "$output_mode" == "json" && "$COMPACT_JSON" != "0" ]] && command -v jq >/dev/null 2>&1; then
  if printf '%s\n' "$raw_output" | jq -c . >/dev/null 2>&1; then
    printf '%s\n' "$raw_output" | jq -c .
    exit 0
  fi
fi

printf '%s\n' "$raw_output"
EOF

chmod +x "$GENERATED_BIN" "$BIN_DIR/jira-mcp" "$BIN_DIR/confluence-mcp"

echo "Verifying wrappers"
"$BIN_DIR/jira-mcp" jira-search --help >/dev/null
"$BIN_DIR/confluence-mcp" confluence-get-page --help >/dev/null

echo "Generated artifacts:"
printf ' - %s\n' "$CONFIG_PATH" "$GENERATED_BIN" "$BIN_DIR/jira-mcp" "$BIN_DIR/confluence-mcp"

echo "Done."
