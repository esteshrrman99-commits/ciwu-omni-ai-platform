#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

TX="${1:-}"

[ -f "$TX" ] || {
    echo "FAIL: transaction missing"
    exit 1
}

python - "$TX" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as f:
    d = json.load(f)

print("Supplier:", d["supplier"])
print("Channel:", d["recipient"]["channel"])
print("Recipient:", d["recipient"]["address"])
print("Current verification:", d["recipient"]["verified"])
PY

echo
echo "Verify this address against the supplier's"
echo "official contact information before continuing."
echo

read -r -p \
"Type VERIFY RECIPIENT to certify the displayed recipient: " X

[ "$X" = "VERIFY RECIPIENT" ] || {
    echo "RECIPIENT_NOT_VERIFIED"
    exit 1
}

python - "$TX" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

path = sys.argv[1]

with open(path, encoding="utf-8") as f:
    d = json.load(f)

if not d["recipient"]["address"]:
    raise SystemExit("RECIPIENT_MISSING")

d["recipient"]["verified"] = True
d["recipient"]["verified_at"] = \
    datetime.now(timezone.utc).isoformat()

tmp = path + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, path)
os.chmod(path, 0o600)
PY

echo "RECIPIENT_VERIFICATION=PASS"
echo "TRANSMISSION=NOT_SENT"
