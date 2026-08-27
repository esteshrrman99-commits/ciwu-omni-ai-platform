#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
OUT="$PROJECT/.ciwu-private/m18/quotes"

META="${1:-}"
QTY="${2:-}"
UNIT="${3:-}"
FREIGHT="${4:-0}"
SETUP="${5:-0}"
TESTING="${6:-0}"

[ -s "$META" ] || {
    echo "USAGE:"
    echo "  $0 VERIFIED_QUOTE_METADATA quantity unit_price [freight] [setup] [testing]"
    exit 2
}

python - "$META" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as f:
    d = json.load(f)

assert d.get("type") == "QUOTE"
assert d["verification"]["state"] == "VERIFIED"

print("✓ VERIFIED QUOTE SOURCE PASS")
PY

mkdir -p "$OUT"
chmod 700 "$OUT"

SOURCE_SHA="$(
    sha256sum "$META" |
    awk '{print $1}'
)"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="$OUT/normalized-${STAMP}.json"

python - \
    "$REPORT" \
    "$META" \
    "$SOURCE_SHA" \
    "$QTY" \
    "$UNIT" \
    "$FREIGHT" \
    "$SETUP" \
    "$TESTING" <<'PY'
from decimal import Decimal, InvalidOperation
import json
import os
import sys
from datetime import datetime, timezone

(
    out,
    source,
    source_sha,
    qty,
    unit,
    freight,
    setup,
    testing
) = sys.argv[1:]

try:
    q = Decimal(qty)
    u = Decimal(unit)
    f = Decimal(freight)
    s = Decimal(setup)
    t = Decimal(testing)
except InvalidOperation:
    raise SystemExit("INVALID_NUMERIC_INPUT")

if q <= 0:
    raise SystemExit("INVALID_QUANTITY")

if any(x < 0 for x in (u, f, s, t)):
    raise SystemExit("NEGATIVE_COST")

subtotal = q * u
landed = subtotal + f + s + t
effective = landed / q

d = {
    "schema": "CIWU_M18_NORMALIZED_QUOTE_V1",

    "supplier": "ProHealth",

    "source": {
        "metadata": source,
        "sha256": source_sha
    },

    "quantity": str(q),
    "unit_price": str(u),
    "product_subtotal": str(subtotal),
    "freight": str(f),
    "setup": str(s),
    "testing": str(t),
    "landed_total": str(landed),
    "effective_unit_cost": str(effective),

    "quote_acceptance": False,
    "purchase_authorization": False,

    "generated_at":
        datetime.now(timezone.utc).isoformat()
}

with open(out, "x", encoding="utf-8") as fh:
    json.dump(d, fh, indent=2)
    fh.write("\n")

os.chmod(out, 0o600)

print("LANDED_TOTAL=" + str(landed))
print("EFFECTIVE_UNIT_COST=" + str(effective))
print("QUOTE_ACCEPTANCE=FALSE")
print("PURCHASE_AUTHORIZATION=FALSE")
PY

echo "NORMALIZED_QUOTE=$REPORT"
