#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../mobile"
ALDIM_RUNTIME="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if [ -x "$ALDIM_RUNTIME/node/bin/node" ]; then
  export PATH="$ALDIM_RUNTIME/node/bin:$ALDIM_RUNTIME/bin/fallback:$PATH"
fi
echo 'Telefon ve Mac aynı Wi-Fi ağında olmalı. QR kodunu SDK 57 destekli Expo Go ile aç.'
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec expo start --go --lan "$@"
else
  exec npx --yes expo start --go --lan "$@"
fi
