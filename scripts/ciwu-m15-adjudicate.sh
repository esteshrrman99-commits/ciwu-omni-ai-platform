#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

META="${1:-}"

[ -f "$META" ] || {
  echo "Usage: $0 /path/to/document.metadata.json"
  exit 2
}

echo
echo "=============================================================="
echo " CIWU EVIDENCE ADJUDICATION"
echo "=============================================================="

cat "$META"

echo
echo "Verification requires actual human document review."
echo

read -r -p \
"Type VERIFIED only if the document itself has been reviewed: " DECISION

[ "$DECISION" = "VERIFIED" ] || {
  echo "EVIDENCE_REMAINS_UNVERIFIED"
  exit 1
}

read -r -p "Reviewer name: " REVIEWER

[ -n "$REVIEWER" ] || {
  echo "FAIL: reviewer required"
  exit 1
}

python - "$META" "$REVIEWER" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

path, reviewer = sys.argv[1:]

with open(path, encoding="utf-8") as f:
    data = json.load(f)

source = data["file"]
expected = data["sha256"]

import hashlib

h = hashlib.sha256()

with open(source, "rb") as f:
    for block in iter(lambda: f.read(1024 * 1024), b""):
        h.update(block)

if h.hexdigest() != expected:
    raise SystemExit("HASH_BINDING_FAILURE")

data["verification"] = {
    "state": "VERIFIED",
    "reviewer": reviewer,
    "reviewed_at": datetime.now(timezone.utc).isoformat()
}

# Verification of one document does NOT itself authorize procurement.
data["commercial_effect"] = {
    "supplier_qualified": False,
    "procurement_authorized": False,
    "purchase_authorized": False
}

tmp = path + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, path)
os.chmod(path, 0o600)
PY

echo
echo "EVIDENCE_ADJUDICATION=VERIFIED"
echo "HASH_BINDING=PASS"
echo "PROCUREMENT_AUTHORIZATION=FALSE"
