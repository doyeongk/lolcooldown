#!/bin/bash
# Checks that what's live is GitHub's main: the running app's image was built from origin/main's commit
# and the public site answers.
set -uo pipefail
cd "$(dirname "$0")/.."
want=$(git ls-remote origin refs/heads/main | cut -f1)
live=$(docker inspect lolcooldown-app --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
code=$(curl -s -o /dev/null -w '%{http_code}' https://lolcooldown.com/)
echo "origin/main $want"
echo "live        $live"
echo "https://lolcooldown.com/ $code"
[ "$want" = "$live" ] && [ "$code" = 200 ]
