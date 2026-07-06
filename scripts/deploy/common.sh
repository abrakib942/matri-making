#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

APPS_START_ORDER=(storage api admin web)
APPS_STOP_ORDER=(web admin api storage)

log() {
  echo ""
  echo "==> $*"
  echo ""
}

cd_root() {
  cd "${ROOT_DIR}"
}

pm2_start_app() {
  local app="$1"
  log "Starting PM2: @repo/${app}"
  pnpm --filter "@repo/${app}" pm2:start
}

pm2_stop_delete_app() {
  local app="$1"
  log "Stopping PM2: @repo/${app}"
  pnpm --filter "@repo/${app}" pm2:stop || true
  pnpm --filter "@repo/${app}" pm2:delete || true
}
