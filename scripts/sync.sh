#!/usr/bin/env bash
# Simple Linux watcher to rebuild/restart on changes (DigitalOcean droplet)
# Usage: chmod +x scripts/sync.sh && ./scripts/sync.sh

set -euo pipefail

watch_paths=(src public app components lib next.config.js tailwind.config.ts tsconfig.json package.json postcss.config.js)

sig() {
  find "${watch_paths[@]}" -type f 2>/dev/null | sort | xargs stat -c "%n:%s:%Y" 2>/dev/null | sha1sum | awk '{print $1}'
}

echo "[sync] Watching for changes... (Ctrl+C to stop)"
last=$(sig || echo "")

while true; do
  sleep 2
  now=$(sig || echo "")
  if [[ "$now" != "$last" ]]; then
    echo "[sync] Change detected. Rebuilding containers..."
    docker compose build --no-cache
    docker compose up -d --force-recreate
    echo "[sync] Redeployed all instances."
    last="$now"
  fi
done
