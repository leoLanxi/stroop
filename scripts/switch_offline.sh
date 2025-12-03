#!/usr/bin/env sh
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.."; pwd)
cp "$ROOT_DIR/variants/offline-static/index.html" "$ROOT_DIR/index.html"
cp "$ROOT_DIR/variants/offline-static/assets/js/modules/api.js" "$ROOT_DIR/assets/js/modules/api.js"
cp "$ROOT_DIR/variants/offline-static/assets/js/modules/auth.js" "$ROOT_DIR/assets/js/modules/auth.js"
cp "$ROOT_DIR/variants/offline-static/assets/js/app.js" "$ROOT_DIR/assets/js/app.js"
echo "Switched to OFFLINE (static) environment"
