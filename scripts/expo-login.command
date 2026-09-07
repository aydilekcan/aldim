#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../mobile"
# This environment belongs only to this command; the user's shell is unchanged.
ALDIM_RUNTIME="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if [ -x "$ALDIM_RUNTIME/node/bin/node" ]; then
  export PATH="$ALDIM_RUNTIME/node/bin:$ALDIM_RUNTIME/bin/fallback:$PATH"
fi
if [ "${1:-}" = "--check" ]; then
  command -v node
  node --version
  if command -v pnpm >/dev/null 2>&1; then pnpm --version; elif command -v npx >/dev/null 2>&1; then npx --version; else exit 1; fi
  exit 0
fi
if command -v pnpm >/dev/null 2>&1; then
  pnpm dlx eas-cli login
elif command -v npx >/dev/null 2>&1; then
  npx --yes eas-cli login
else
  echo 'Node.js bulunamadı. nodejs.org adresinden LTS sürümünü kurup tekrar aç.'
  read -r -p 'Kapatmak için Enter…'
  exit 1
fi
read -r -p 'İşlem tamamlandı. Kapatmak için Enter…'
