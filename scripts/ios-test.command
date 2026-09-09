#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../mobile"
ALDIM_RUNTIME="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if [ -x "$ALDIM_RUNTIME/node/bin/node" ]; then
  export PATH="$ALDIM_RUNTIME/node/bin:$ALDIM_RUNTIME/bin/fallback:$PATH"
fi
aldim_eas() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm --config.ignore-scripts=true dlx eas-cli "$@"
  elif command -v npx >/dev/null 2>&1; then
    npx --yes --ignore-scripts eas-cli "$@"
  else
    echo 'Node.js LTS kurulumu gerekiyor: https://nodejs.org'
    return 1
  fi
}
case "${1:-credentials}" in
  credentials) aldim_eas credentials:configure-build -p ios -e development ;;
  device) aldim_eas device:create ;;
  build) aldim_eas build -p ios -e development --no-wait ;;
  start)
    if command -v pnpm >/dev/null 2>&1; then pnpm exec expo start --dev-client --lan; else npx expo start --dev-client --lan; fi
    ;;
  *) echo 'Kullanım: bash scripts/ios-test.command [credentials|device|build|start]'; exit 1 ;;
esac
