#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private"
EXPORTS="$PRIVATE/exports"

cd "$PROJECT"

SUPPLIER_ID="${1:-prohealth}"
QUANTITY="${2:-1000}"

case "$QUANTITY" in
  *[!0-9]*|"")
    echo "FAIL: quantity must be a positive integer"
    exit 1
    ;;
esac

[ "$QUANTITY" -gt 0 ] || {
  echo "FAIL: quantity must be positive"
  exit 1
}

mkdir -p "$EXPORTS"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTPUT="$EXPORTS/ciwu-${SUPPLIER_ID}-rfq-${STAMP}.txt"

LOCAL_PORT="$(
python -c '
import socket

s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
'
)"

LOG="$PRIVATE/m13-rfq-runtime.log"

PORT="$LOCAL_PORT" \
NODE_ENV=development \
node src/enhanced-api.js \
  >"$LOG" 2>&1 &

PID=$!

cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}

trap cleanup EXIT

READY=0

for _ in $(seq 1 30); do

  HTTP="$(
    curl \
      -sS \
      --connect-timeout 2 \
      --max-time 5 \
      -o "$OUTPUT" \
      -w '%{http_code}' \
      "http://127.0.0.1:$LOCAL_PORT/api/m12/rfq/$SUPPLIER_ID?quantity=$QUANTITY" \
      || true
  )"

  if [ "$HTTP" = "200" ]; then
    READY=1
    break
  fi

  sleep 1
done

[ "$READY" -eq 1 ] || {
  echo "FAIL: RFQ export unavailable"
  tail -80 "$LOG" || true
  exit 1
}

chmod 600 "$OUTPUT"

echo "RFQ_FILE=$OUTPUT"
echo "RFQ_STATE=READY_NOT_SENT"
echo "✓ RFQ EXPORT PASS"
