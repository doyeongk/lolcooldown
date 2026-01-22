#\!/bin/bash
set -e

if [ -f .env.local ]; then
  export $(grep DEPLOY_HOST .env.local | xargs)
fi

if [ -z "$DEPLOY_HOST" ]; then
  echo "Error: DEPLOY_HOST not set. Create .env.local with DEPLOY_HOST=user@host"
  exit 1
fi

ssh "$DEPLOY_HOST" 'cd /home/do/Code/lolcooldown && git pull && docker compose -f docker-compose.prod.yml build && docker compose --env-file .env.prod -f docker-compose.prod.yml up -d'
