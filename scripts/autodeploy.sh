#!/bin/bash
# Home deploys itself (DOS-487): a systemd user timer runs this every minute in the live checkout. When
# origin/main has moved past the last deployed commit, it fast-forwards, builds and restarts the app, then
# waits for it to answer. A commit that fails is not retried every minute; the next push is.
#
#   scripts/autodeploy.sh   deploy origin/main if it isn't live yet
#
# State lives in $LOLCD_STATE (default ~/.local/state/lolcooldown): `deployed` and `failed` hold SHAs.
set -uo pipefail

main() {
  cd "$(dirname "$0")/.." || exit 1
  local state=${LOLCD_STATE:-$HOME/.local/state/lolcooldown}
  local url=${LOLCD_URL:-http://127.0.0.1:8082/}
  mkdir -p "$state"
  # Shared with reseed.sh so a deploy and a reseed never build at once.
  exec 9>"$state/lock"
  flock -n 9 || exit 0

  git fetch -q origin main || { echo "fetch failed"; return 1; }
  local target
  target=$(git rev-parse origin/main)
  [ "$target" = "$(cat "$state/deployed" 2>/dev/null)" ] && return 0
  [ "$target" = "$(cat "$state/failed" 2>/dev/null)" ] && return 0

  echo "deploying $target"
  fail() { echo "deploy of $target failed: $1"; echo "$target" >"$state/failed"; return 1; }
  git checkout -q -- . && git merge -q --ff-only origin/main || { fail "checkout cannot fast-forward"; return 1; }
  export GIT_SHA=$target
  docker compose -f docker-compose.prod.yml build || { fail build; return 1; }
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d || { fail "compose up"; return 1; }

  local i
  for i in $(seq 60); do
    curl -sf -o /dev/null "$url" && break
    [ "$i" = 60 ] && { fail "app did not answer $url"; return 1; }
    sleep 1
  done
  echo "$target" >"$state/deployed"
  rm -f "$state/failed"
  echo "deployed $target"
}

# Wrapped in main and exited here: the merge above can rewrite this file while bash is still reading it.
main "$@"
exit $?
