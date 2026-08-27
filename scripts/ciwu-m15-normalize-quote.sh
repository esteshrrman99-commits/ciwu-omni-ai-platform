#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

SUPPLIER="${1:-}"
QTY="${2:-}"
UNIT="${3:-}"
FREIGHT="${4:-0}"
SETUP="${5:-0}"

[ -n "$SUPPLIER" ] &&
[ -n "$QTY" ] &&
[ -n "$UNIT" ] || {
  echo "Usage:"
  echo "$0 supplier quantity unit_price [freight] [setup]"
  exit 2
}

python - \
 "$SUPPLIER" \
 "$QTY" \
 "$UNIT" \
 "$FREIGHT" \
 "$SETUP" <<'PY'
from decimal import Decimal, InvalidOperation
import sys

supplier, qty, unit, freight, setup = sys.argv[1:]

try:
    q = Decimal(qty)
    u = Decimal(unit)
    f = Decimal(freight)
    s = Decimal(setup)
except InvalidOperation:
    raise SystemExit("INVALID_NUMERIC_INPUT")

if q <= 0 or u < 0 or f < 0 or s < 0:
    raise SystemExit("INVALID_QUOTE_VALUES")

subtotal = q * u
landed = subtotal + f + s
effective = landed / q

print("CIWU_QUOTE_NORMALIZATION")
print(f"SUPPLIER={supplier}")
print(f"QUANTITY={q}")
print(f"UNIT_PRICE={u:.4f}")
print(f"PRODUCT_SUBTOTAL={subtotal:.2f}")
print(f"FREIGHT={f:.2f}")
print(f"SETUP={s:.2f}")
print(f"LANDED_TOTAL={landed:.2f}")
print(f"EFFECTIVE_UNIT_COST={effective:.4f}")
print("QUOTE_VERIFICATION=UNVERIFIED_UNLESS_BOUND_TO_EVIDENCE")
print("PURCHASE_AUTHORIZATION=FALSE")
PY
