#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="codepulse-sidecar"
CONTAINER="sandbox-sidecar"

echo "Building $IMAGE..."
docker build -t "$IMAGE" "$REPO_DIR/backend/sandbox_sidecar"

echo "Stopping old container (if any)..."
docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true

echo "Starting $CONTAINER..."
docker run -d \
  --name "$CONTAINER" \
  -p 127.0.0.1:8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  "$IMAGE"

echo "Done. Status:"
docker ps --filter "name=$CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
