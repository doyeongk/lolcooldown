#!/bin/bash
# Drives scripts/autodeploy.sh against a scratch GitHub (a bare repo) with docker and curl stubbed, and checks
# that each push deploys exactly once, a broken commit isn't rebuilt every minute, the next push recovers, a
# push that rewrites autodeploy.sh itself deploys cleanly, and a run that finds the lock held does nothing.
set -uo pipefail
src=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
export LOLCD_STATE=$tmp/state LOLCD_URL=http://stub/ GIT_AUTHOR_NAME=b GIT_AUTHOR_EMAIL=b@b GIT_COMMITTER_NAME=b GIT_COMMITTER_EMAIL=b@b

mkdir -p "$tmp/bin" "$tmp/dev/scripts"
cat >"$tmp/bin/docker" <<'EOF'
#!/bin/bash
echo "$* GIT_SHA=${GIT_SHA:-}" >>"$LOLCD_STATE/../docker.log"
[[ "$*" == *build* && -e "$LOLCD_STATE/../break-build" ]] && exit 1
exit 0
EOF
printf '#!/bin/bash\nexit 0\n' >"$tmp/bin/curl"
chmod +x "$tmp/bin/"*
export PATH=$tmp/bin:$PATH

git init -q --bare -b main "$tmp/origin.git"
cd "$tmp/dev" && git init -q -b main && git remote add origin "$tmp/origin.git"
cp "$src/scripts/autodeploy.sh" scripts/ && echo a >app && git add -A && git commit -qm one && git push -q origin main
git clone -q "$tmp/origin.git" "$tmp/live"

fail=0
push() { cd "$tmp/dev" && echo "$1" >>app && git commit -qam "$1" && git push -q origin main && git rev-parse HEAD; }
run() { : >"$tmp/docker.log"; "$tmp/live/scripts/autodeploy.sh" >/dev/null 2>&1; }
builds() { grep -c '^compose -f docker-compose.prod.yml build' "$tmp/docker.log"; }
check() { if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: got '$2', want '$3'"; fail=1; fi; }
head_of() { git -C "$tmp/live" rev-parse HEAD; }

run; check "first run deploys main" "$(cat "$LOLCD_STATE/deployed")" "$(git -C "$tmp/dev" rev-parse HEAD)"

sha=$(push two); run
check "a push deploys" "$(cat "$LOLCD_STATE/deployed")" "$sha"
check "the live checkout moves to it" "$(head_of)" "$sha"
check "the image is built with its SHA" "$(grep -c "build GIT_SHA=$sha" "$tmp/docker.log")" 1
check "the app is restarted" "$(grep -c ' up -d ' "$tmp/docker.log")" 1

run; check "no push, no rebuild" "$(builds)" 0

touch "$tmp/break-build"; bad=$(push three); run
check "a failed build is recorded" "$(cat "$LOLCD_STATE/failed")" "$bad"
check "the failed commit isn't marked deployed" "$(cat "$LOLCD_STATE/deployed")" "$sha"
run; check "a failed commit isn't rebuilt every minute" "$(builds)" 0

rm "$tmp/break-build"; good=$(push four); run
check "the next push deploys" "$(cat "$LOLCD_STATE/deployed")" "$good"
check "and clears the failure" "$(test -e "$LOLCD_STATE/failed" && echo yes || echo no)" no

cd "$tmp/dev" && { printf '# a longer header line that shifts every byte offset below it\n'; cat scripts/autodeploy.sh; } >x \
  && mv x scripts/autodeploy.sh && chmod +x scripts/autodeploy.sh && git commit -qam self && git push -q origin main
self=$(git rev-parse HEAD); run; status=$?
check "a push that rewrites autodeploy.sh deploys" "$(cat "$LOLCD_STATE/deployed")/$status" "$self/0"

last=$(push five)
exec 8>"$LOLCD_STATE/lock"; flock 8
run; check "a run that finds the lock held does nothing" "$(builds)" 0
exec 8>&-
run; check "and the next run deploys" "$(cat "$LOLCD_STATE/deployed")" "$last"

exit $fail
