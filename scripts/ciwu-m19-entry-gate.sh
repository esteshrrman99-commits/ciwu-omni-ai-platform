#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
ROOT="$PROJECT/.ciwu-private/m18/responses"

mkdir -p "$ROOT"

COUNT="$(
find "$ROOT" \
  -maxdepth 1 \
  -type f \
  ! -name '*.metadata.json' \
  2>/dev/null |
wc -l |
tr -d ' '
)"

echo "REAL_RESPONSE_ARTIFACTS=$COUNT"

if [ "$COUNT" -eq 0 ]; then
    echo "M19_ENTRY_GATE=BLOCKED"
    echo "REASON=NO_REAL_SUPPLIER_RESPONSE"
    echo "SUPPLIER_QUALIFIED=NO"
    echo "PURCHASE_AUTHORIZATION=FALSE"
    exit 10
fi

VERIFIED=0

for meta in "$ROOT"/*.metadata.json; do
    [ -e "$meta" ] || continue

    result="$(
    python - "$meta" <<'PY'
import json,sys

try:
    d=json.load(open(sys.argv[1]))
except Exception:
    print("NO")
    raise SystemExit

state=d.get("verification",{}).get("state")

correlated=(
    d.get("correlation",{})
    .get("outbound_transaction_bound")
)

identity=(
    d.get("correlation",{})
    .get("supplier_identity_verified")
)

print(
    "YES"
    if (
        state == "VERIFIED"
        and correlated is True
        and identity is True
    )
    else "NO"
)
PY
    )"

    if [ "$result" = "YES" ]; then
        VERIFIED=$((VERIFIED+1))
    fi
done

echo "VERIFIED_RESPONSE_ARTIFACTS=$VERIFIED"

if [ "$VERIFIED" -eq 0 ]; then
    echo "M19_ENTRY_GATE=BLOCKED"
    echo "REASON=RESPONSE_NOT_VERIFIED"
    echo "SUPPLIER_QUALIFIED=NO"
    echo "PURCHASE_AUTHORIZATION=FALSE"
    exit 11
fi

echo "M19_ENTRY_GATE=PASS"
echo "REAL_RESPONSE_VERIFIED=YES"
echo "SUPPLIER_QUALIFICATION=NOT_YET_GRANTED"
echo "PURCHASE_AUTHORIZATION=FALSE"
