#!/usr/bin/env bash
# git-sync: on-stop.sh
# Auto-commit all changes and push at end of Claude session.

WORKDIR="${CLAUDE_WORKING_DIR:-$PWD}"
cd "$WORKDIR" || exit 0

# Not a git repo — skip silently
git rev-parse --git-dir > /dev/null 2>&1 || exit 0

REPO=$(basename "$WORKDIR")
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# ── Submodules: commit each dirty submodule first ────────────────────────────
if [ -f ".gitmodules" ]; then
  git submodule foreach --quiet '
    if ! git diff --quiet || ! git diff --staged --quiet || [ -n "$(git status --porcelain)" ]; then
      echo "[git-sync] Committing submodule: $name" >&2
      git add -A
      git commit -m "chore: auto-sync by Claude — '"$TIMESTAMP"'" --quiet 2>/dev/null || true
      git push --quiet 2>/dev/null || echo "[git-sync] Submodule push failed: $name" >&2
    fi
  ' 2>&1 || true
fi

# ── Main repo ────────────────────────────────────────────────────────────────
STATUS=$(git status --porcelain 2>/dev/null)

if [ -z "$STATUS" ]; then
  echo "[git-sync] Nothing to commit in $REPO" >&2
  exit 0
fi

echo "[git-sync] Changes detected in $REPO — committing..." >&2

git add -A

# Build commit message with list of changed files (max 5)
CHANGED=$(git diff --staged --name-only | head -5 | tr '\n' ', ' | sed 's/,$//')
TOTAL=$(git diff --staged --name-only | wc -l | tr -d ' ')
if [ "$TOTAL" -gt 5 ]; then
  FILE_SUMMARY="$CHANGED ... (+$((TOTAL - 5)) more)"
else
  FILE_SUMMARY="$CHANGED"
fi

COMMIT_MSG="chore: auto-sync by Claude — $TIMESTAMP

Files: $FILE_SUMMARY"

git commit -m "$COMMIT_MSG" --quiet

# Push
if git push --quiet 2>&1; then
  echo "[git-sync] Pushed ✓  ($TOTAL file(s) committed)" >&2
else
  echo "[git-sync] Commit saved locally — push failed (check auth/network)" >&2
fi
