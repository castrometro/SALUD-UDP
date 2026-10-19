#!/bin/bash
set -e

cd /var/www/dev

if [ ! -f .env.prod ]; then
echo "ERROR: No existe .env.prod"
exit 1
fi

echo "==> Pulling latest code..."
git pull origin production

echo "==> Rebuilding and restarting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

echo "==> Cleaning old images..."
docker image prune -f

echo "==> Deploy complete!"
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
