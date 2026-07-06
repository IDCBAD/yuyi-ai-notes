#!/usr/bin/env bash

set -euo pipefail

MODE="${1:-full}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

if grep -qi microsoft /proc/version 2>/dev/null && command -v cmd.exe >/dev/null 2>&1; then
  NPM=(cmd.exe /c npm)
else
  NPM=(npm)
fi

echo "==> clean build artifacts"
rm -rf .next .open-next

echo "==> npm run lint"
"${NPM[@]}" run lint

echo "==> npm run test:run"
"${NPM[@]}" run test:run

if [[ "${MODE}" == "full" ]]; then
  echo "==> npx @opennextjs/cloudflare@latest build"
  npx @opennextjs/cloudflare@latest build
else
  echo "==> npm run build"
  "${NPM[@]}" run build
fi

echo "Verification complete (${MODE})."
