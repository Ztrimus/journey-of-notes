#!/usr/bin/env bash
# scripts/post-merge.sh
#
# Run after your PR is merged on GitHub to:
#   1. Confirm the PR is merged
#   2. Confirm the remote branch was auto-deleted
#   3. Delete the local branch
#   4. Switch to main and pull latest
#
# Usage (from anywhere inside the repo):
#   ./scripts/post-merge.sh
#   ./scripts/post-merge.sh my-branch   # specify branch explicitly

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}!${NC} $*"; }
die()  { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

# ── Resolve branch ────────────────────────────────────────────────────────────
BRANCH="${1:-$(git branch --show-current)}"

[[ "$BRANCH" == "main" || "$BRANCH" == "master" ]] && \
  die "Already on default branch. Nothing to clean up."

[[ -z "$BRANCH" ]] && die "Could not determine current branch."

echo "Branch: ${YELLOW}${BRANCH}${NC}"
echo ""

# ── Step 1: Check PR is merged ────────────────────────────────────────────────
echo "Step 1 — Checking PR status on GitHub..."

PR_STATE=$(gh pr view "$BRANCH" --json state --jq '.state' 2>/dev/null || echo "NOT_FOUND")

if [[ "$PR_STATE" == "MERGED" ]]; then
  ok "PR is merged."
elif [[ "$PR_STATE" == "OPEN" ]]; then
  die "PR is still OPEN — merge it on GitHub before running this script."
elif [[ "$PR_STATE" == "CLOSED" ]]; then
  die "PR was closed (not merged). Switch branches manually."
else
  warn "No PR found for branch '${BRANCH}'. Continuing anyway (manual branch)."
fi

# ── Step 2: Check remote branch is deleted ────────────────────────────────────
echo ""
echo "Step 2 — Checking remote branch..."

git fetch --prune origin 2>/dev/null

REMOTE_EXISTS=$(git ls-remote --heads origin "$BRANCH" | wc -l | tr -d ' ')

if [[ "$REMOTE_EXISTS" == "0" ]]; then
  ok "Remote branch already deleted (auto-delete on merge is on)."
else
  warn "Remote branch still exists — deleting it now..."
  git push origin --delete "$BRANCH"
  ok "Remote branch deleted."
fi

# ── Step 3: Delete local branch ───────────────────────────────────────────────
echo ""
echo "Step 3 — Deleting local branch..."

# Switch off the branch first if we're on it
CURRENT=$(git branch --show-current)
if [[ "$CURRENT" == "$BRANCH" ]]; then
  git checkout main --quiet
fi

git branch -d "$BRANCH" 2>/dev/null || git branch -D "$BRANCH"
ok "Local branch '${BRANCH}' deleted."

# ── Step 4: Switch to main and pull ───────────────────────────────────────────
echo ""
echo "Step 4 — Switching to main and pulling latest..."

git checkout main --quiet
git pull origin main --ff-only
ok "On main — up to date."

echo ""
echo -e "${GREEN}All done.${NC} Ready for next feature."
echo "  Next step: create a GitHub Issue, then branch with:"
echo "  git checkout -b <type>/#<issue-id>/<description>"
