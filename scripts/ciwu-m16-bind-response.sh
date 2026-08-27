#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

TX="${1:-}"
RESPONSE="${2:-}"
TYPE="${3:-SUPPLIER_RESPONSE}"

[ -f "$TX" ] || {
    echo "FAIL: transaction missing"
    exit 1
}

[ -f "$RESPONSE" ] || {
    echo "FAIL: response file missing"
    exit 1
}

SHA="$(sha256sum "$RESPONSE" | awk '{print $1}')"

python - "$TX" "$RESPONSE" "$TYPE" "$SHA" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

path, response, typ, sha = sys.argv[1:]

with open(path, encoding="utf-8") as f:
    d = json.load(f)

if not d["delivery"]["status"].startswith("SENT_"):
    raise SystemExit("NO_VERIFIED_OUTBOUND_TRANSACTION")

evidence = {
    "type": typ,
    "path": response,
    "sha256": sha,
    "received_at": datetime.now(timezone.utc).isoformat(),
    "verification": "UNVERIFIED"
}

d["response"]["received"] = True
d["response"]["received_at"] = evidence["received_at"]
d["response"]["evidence"].append(evidence)

tmp = path + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, path)
os.chmod(path, 0o600)
PY

echo "SUPPLIER_RESPONSE_BOUND"
echo "SHA256=$SHA"
echo "VERIFICATION=UNVERIFIED"
echo "PURCHASE_AUTHORIZATION=FALSE"
