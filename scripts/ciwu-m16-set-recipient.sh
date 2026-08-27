#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

TX="${1:-}"
CHANNEL="${2:-}"
ADDRESS="${3:-}"

[ -f "$TX" ] || {
    echo "FAIL: transaction file missing"
    exit 1
}

[ "$CHANNEL" = "EMAIL" ] || {
    echo "FAIL: currently supported channel = EMAIL"
    exit 1
}

[ -n "$ADDRESS" ] || {
    echo "FAIL: recipient required"
    exit 1
}

case "$ADDRESS" in
  *@*.*) ;;
  *)
    echo "FAIL: invalid email syntax"
    exit 1
    ;;
esac

python - "$TX" "$CHANNEL" "$ADDRESS" <<'PY'
import json
import os
import sys

path, channel, address = sys.argv[1:]

with open(path, encoding="utf-8") as f:
    d = json.load(f)

if d["delivery"]["status"] != "NOT_SENT":
    raise SystemExit("TRANSACTION_ALREADY_ADVANCED")

d["recipient"] = {
    "channel": channel,
    "address": address,
    "verified": False
}

tmp = path + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, path)
os.chmod(path, 0o600)
PY

echo "RECIPIENT_REGISTERED"
echo "RECIPIENT_VERIFICATION=REQUIRED"
echo "TRANSMISSION=NOT_SENT"
