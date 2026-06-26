#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
if [[ ! -f dist/hooks/logFileEdit.js ]]; then
  npm run build --silent
fi
exec node dist/hooks/logFileEdit.js
