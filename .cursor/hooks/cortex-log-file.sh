#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="$(cd "$(dirname "$0")/../.." && pwd)"
CORTEX_ROOT="$WORKSPACE/Cortex"
cd "$CORTEX_ROOT"
if [[ ! -f dist/hooks/logFileEdit.js ]]; then
  npm run build --silent
fi
exec node dist/hooks/logFileEdit.js
