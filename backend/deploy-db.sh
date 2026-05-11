#!/bin/bash
set -e

WORKDIR=/home/codepulse/projects/CodePulse/backend
cd "$WORKDIR"

# backup
echo "Backing up DB..."
pg_dump -U codepulse codepulse > /tmp/codepulse-backup-$(date +%Y%m%d-%H%M%S).sql

echo "Running flask db upgrade..."
venv/bin/flask db upgrade

echo "Schema migration done."

echo "Running data migrations..."
venv/bin/python data_migrations/runner.py

echo "DB update complete."
