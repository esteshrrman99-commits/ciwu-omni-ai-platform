#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

TX="${1:-}"
RECEIPT="${2:-}"

[ -f "$TX" ] || {
    echo "FAIL: transaction missing"
    exit 1
}

[ -f "$RECEIPT" ] || {
    echo "FAIL: real transmission receipt/evidence file required"
    exit 1
}

RECEIPT_SHA="$(sha256sum "$RECEIPT" | awk '{print $1}')"

python - \
 "$TX" \
 "$RECEIPT" \
 "$RECEIPT_SHA" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

path, receipt, sha = sys.argv[1:]

with open(path, encoding="utf-8") as f:
    d = json.load(f)

if d["recipient"]["verified"] is not True:
    raise SystemExit("RECIPIENT_NOT_VERIFIED")

if d["delivery"]["status"] != "NOT_SENT":
    raise SystemExit("TRANSACTION_ALREADY_RECORDED")

d["delivery"] = {
    "status": "SENT_EXTERNALLY_CONFIRMED",
    "sent_at": datetime.now(timezone.utc).isoformat(),
    "receipt": {
        "path": receipt,
        "sha256": sha
    }
}

# A transmission receipt has zero purchase authority.
d["commercial_effect"] = {
    "supplier_qualified": False,
    "procurement_authorized": False,
    "purchase_authorized": False
}

tmp = path + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, path)
os.chmod(path, 0o600)
PY

echo "REAL_TRANSMISSION_RECEIPT_BOUND"
echo "RECEIPT_SHA256=$RECEIPT_SHA"
echo "PURCHASE_AUTHORIZATION=FALSE"
