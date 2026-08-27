#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
INBOX="$PROJECT/.ciwu-private/supplier-inbox"

SUPPLIER="${1:-prohealth}"
DIR="$INBOX/$SUPPLIER"

echo
echo "=============================================================="
echo " CIWU M15 — SUPPLIER QUALIFICATION"
echo "=============================================================="
echo "SUPPLIER=$SUPPLIER"

[ -d "$DIR" ] || {
  echo "EVIDENCE_DOCUMENTS=0"
  echo "QUALIFICATION=BLOCKED"
  exit 0
}

python - "$DIR" <<'PY'
import glob
import json
import os
import sys

root = sys.argv[1]

types = {}

for path in glob.glob(os.path.join(root, "*.metadata.json")):
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
    except Exception:
        continue

    typ = str(d.get("evidence_type", "")).upper()
    verified = (
        d.get("verification", {}).get("state") == "VERIFIED"
    )

    if verified:
        types[typ] = True

required_groups = {
    "MANUFACTURER": ["MANUFACTURER"],
    "GMP": ["GMP", "CGMP"],
    "COA": ["COA"],
    "QUOTE": ["QUOTE"],
    "FORMULA": ["FORMULA", "FORMULA_SPEC"]
}

missing = []

for gate, aliases in required_groups.items():
    if not any(types.get(a, False) for a in aliases):
        missing.append(gate)

print("VERIFIED_TYPES=" + ",".join(sorted(types)) if types else
      "VERIFIED_TYPES=NONE")

if missing:
    print("MISSING=" + ",".join(missing))
    print("EVIDENCE_COMPLETE=NO")
    print("SUPPLIER_QUALIFIED=NO")
    print("PROCUREMENT_AUTHORIZATION=FALSE")
else:
    print("MISSING=NONE")
    print("EVIDENCE_COMPLETE=YES")
    print("SUPPLIER_QUALIFIED=EVIDENCE_GATE_PASS")
    print("PROCUREMENT_AUTHORIZATION=FALSE")

print("PURCHASE_AUTHORIZATION=FALSE")
PY
