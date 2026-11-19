#!/bin/bash
# Weekly refresh of champions, abilities and skins from Community Dragon (lolcooldown-reseed.timer, DOS-487).
# The app reads the database through a one-hour cache and serves new images from the shared volume, so no
# redeploy is needed.
set -euo pipefail
cd "$(dirname "$0")/.."
state=${LOLCD_STATE:-$HOME/.local/state/lolcooldown}
mkdir -p "$state"
# Waits for a running deploy (autodeploy.sh holds the same lock).
exec 9>"$state/lock"
flock 9

compose=(docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools)
"${compose[@]}" build seed
"${compose[@]}" run --rm seed
