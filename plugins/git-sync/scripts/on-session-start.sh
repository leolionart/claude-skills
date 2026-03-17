#!/usr/bin/env bash
# git-sync: on-session-start.sh
# Pull latest from GitHub for main repo and all submodules.

WORKDIR="${CLAUDE_WORKING_DIR:-$PWD}"
cd "$WORKDIR" || exit 0

# Not a git repo — skip silently
git rev-parse --git-dir > /dev/null 2>&1 || exit 0

REPO=$(basename "$WORKDIR")
echo "[git-sync] Pulling latest for: $REPO" >&2

# Pull main repo — rebase + autostash so WIP is preserved
if git pull --rebase --autostash --quiet 2>&1; then
  echo "[git-sync] Main repo up to date ✓" >&2
else
  echo "[git-sync] Pull failed (may be offline or no upstream) — skipping" >&2
  exit 0
fi

# Update submodules if any exist
if [ -f ".gitmodules" ]; then
  echo "[git-sync] Updating submodules..." >&2
  git submodule update --init --recursive --remote --merge --quiet 2>&1 \
    || echo "[git-sync] Submodule update had warnings — continuing" >&2
  echo "[git-sync] Submodules updated ✓" >&2
fi
