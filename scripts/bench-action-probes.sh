#!/bin/bash
# Replays the bot probes that made production log "Failed to find Server Action" (DOS-485) and fails if
# the server logs it, or if the pages and API stop answering GETs.
#
#   scripts/bench-action-probes.sh          build this checkout's Docker image and replay against it
#   scripts/bench-action-probes.sh --live   replay against the running lolcooldown-app container
set -uo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--live" ]; then
  container=lolcooldown-app
  url=http://127.0.0.1:8082
else
  container=lolcooldown-bench-$$
  url=http://127.0.0.1:18485
  docker build -q -t lolcooldown-bench . >/dev/null || exit 1
  # No database: the home page renders without splashes, which is enough here.
  docker run -d --name "$container" -p 127.0.0.1:18485:3000 \
    -e DATABASE_URL=postgresql://x:x@127.0.0.1:1/x lolcooldown-bench >/dev/null || exit 1
  trap 'docker rm -f "$container" >/dev/null' EXIT
  for _ in $(seq 30); do curl -sf -o /dev/null "$url/play/random" && break; sleep 1; done
fi

since=$(date -u +%Y-%m-%dT%H:%M:%S.%NZ)
fail=0
expect() { # name, expected status, curl args...
  local name=$1 want=$2; shift 2
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' "$@")
  if [ "$got" = "$want" ]; then echo "ok   $name: $got"; else echo "FAIL $name: got $got, want $want"; fail=1; fi
}

# The two probes from the production log: an unknown action id, and form posts with no id.
expect 'POST / Next-Action: x' 405 -X POST "$url/" -H 'Next-Action: x' -H 'Content-Type: text/plain' -d '[]'
expect 'POST / multipart form' 405 -X POST "$url/" -F 'foo=bar'
expect 'POST / $ACTION_ID form' 405 -X POST "$url/" -F '$ACTION_REF_1=' -F '1_$ACTION_ID_x=x'
expect 'POST /play/random Next-Action: x' 405 -X POST "$url/play/random" -H 'Next-Action: x' -d '[]'
# What players use must still work.
expect 'GET /' 200 "$url/"
expect 'GET /play/random' 200 "$url/play/random"
expect 'GET /play/random (RSC)' 200 "$url/play/random" -H 'RSC: 1'
api=$(curl -s -o /dev/null -w '%{http_code}' "$url/api/game/random")
if [ "$api" = 405 ]; then echo "FAIL GET /api/game/random: 405 (proxy caught the API)"; fail=1; else echo "ok   GET /api/game/random: $api (reaches the route)"; fi

sleep 1
logged=$(docker logs --since "$since" "$container" 2>&1 | grep -c 'Failed to find Server Action')
if [ "$logged" = 0 ]; then echo "ok   no 'Failed to find Server Action' in the log"; else echo "FAIL logged 'Failed to find Server Action' $logged times"; fail=1; fi

[ $fail = 0 ] && echo PASS || echo FAIL
exit $fail
