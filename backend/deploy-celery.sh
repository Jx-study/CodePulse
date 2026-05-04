#!/bin/bash
set -e

CONTAINER="codepulse-redis"
REDIS_PORT="127.0.0.1:6379:6379"
DATA_VOLUME="codepulse-redis-data"

echo "Stopping old Redis container (if any)..."
docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true

echo "Starting Redis..."
docker run -d \
  --name "$CONTAINER" \
  -p "$REDIS_PORT" \
  -v "$DATA_VOLUME":/data \
  --restart unless-stopped \
  redis:7-alpine \
  redis-server --appendonly yes

echo "Done. Status:"
docker ps --filter "name=$CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
