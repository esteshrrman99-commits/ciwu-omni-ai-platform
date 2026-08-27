#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

PORT=10000
LOGFILE="$ROOT/.eons_snapshots/m15-runtime-regression.log"

mkdir -p .eons_snapshots
rm -f "$LOGFILE"

SERVER_PID=""

cleanup() {
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

echo "============================================================"
echo "EONS M15 FUNCTIONAL REGRESSION"
echo "============================================================"

echo
echo "=== 1. ROUTE SOURCE ==="

if [[ -f src/routes/eons-models.js ]]; then
    echo "M15 route file: PASS"
else
    echo "M15 route file: FAIL"
    exit 1
fi

echo
echo "=== 2. CANONICAL MOUNT ==="

if grep -q "app.use('/api/eons-models', eonsModelsRouter)" src/server.js; then
    echo "M15 canonical mount: PASS"
else
    echo "M15 canonical mount: FAIL"
    exit 1
fi

echo
echo "=== 3. ROUTE DEFINITIONS ==="

if grep -q 'router.get("/status"' src/routes/eons-models.js &&
   grep -q 'router.get("/available"' src/routes/eons-models.js; then
    echo "M15 status route: PASS"
    echo "M15 available route: PASS"
else
    echo "M15 route definitions: FAIL"
    exit 1
fi

echo
echo "=== 4. JAVASCRIPT SYNTAX ==="

if node --check src/routes/eons-models.js; then
    echo "M15 syntax: PASS"
else
    echo "M15 syntax: FAIL"
    exit 1
fi

echo
echo "=== 5. START CANONICAL SERVER ==="

node src/server.js > "$LOGFILE" 2>&1 &
SERVER_PID=$!

echo "SERVER_PID=$SERVER_PID"

sleep 3

if kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Canonical server process: PASS"
else
    echo "Canonical server process: FAIL"
    cat "$LOGFILE"
    exit 1
fi

echo
echo "=== 6. SERVER STARTUP ==="

cat "$LOGFILE"

if grep -q "Server running on port 10000" "$LOGFILE"; then
    echo "Server startup: PASS"
else
    echo "Server startup message: REVIEW"
fi

echo
echo "=== 7. M15 STATUS ENDPOINT ==="

STATUS_RESPONSE="$(curl -fsS --max-time 5 \
    http://127.0.0.1:10000/api/eons-models/status)"

printf '%s\n' "$STATUS_RESPONSE"

if printf '%s\n' "$STATUS_RESPONSE" | grep -q '"success":true'; then
    echo "M15 /status: PASS"
else
    echo "M15 /status: FAIL"
    exit 1
fi

if printf '%s\n' "$STATUS_RESPONSE" | grep -q 'EONS OMNIMODEL FRONTIER'; then
    echo "M15 architecture identity: PASS"
else
    echo "M15 architecture identity: FAIL"
    exit 1
fi

echo
echo "=== 8. M15 AVAILABLE MODELS ==="

AVAILABLE_RESPONSE="$(curl -fsS --max-time 5 \
    http://127.0.0.1:10000/api/eons-models/available)"

printf '%s\n' "$AVAILABLE_RESPONSE"

if printf '%s\n' "$AVAILABLE_RESPONSE" | grep -q '"success":true'; then
    echo "M15 /available: PASS"
else
    echo "M15 /available: FAIL"
    exit 1
fi

if printf '%s\n' "$AVAILABLE_RESPONSE" | grep -q '"models"'; then
    echo "M15 model payload: PASS"
else
    echo "M15 model payload: FAIL"
    exit 1
fi

echo
echo "=== 9. PROCESS ==="

ps -p "$SERVER_PID" -o pid,cmd

echo
echo "=== 10. FINAL STATUS ==="

echo "M15_FUNCTIONAL_REGRESSION=PASS"
echo "READ_ONLY=true"
echo "COMMIT=false"
echo "PUSH=false"
echo "DEPLOYMENT=false"
echo "DESTRUCTIVE_OPERATIONS=false"

echo
echo "============================================================"
echo "M15 FUNCTIONAL REGRESSION PASSED"
echo "============================================================"
