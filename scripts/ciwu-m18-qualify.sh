#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
ROOT="$PROJECT/.ciwu-private/m18"

python - "$ROOT" <<'PY'
import glob
import json
import os
import sys

root = sys.argv[1]

verified = set()

# Real supplier response
for meta in glob.glob(
    os.path.join(root, "responses", "*.metadata.json")
):
    try:
        d = json.load(open(meta))
    except Exception:
        continue

    if (
        d.get("verification", {}).get("state")
        == "VERIFIED"
    ):
        verified.add("SUPPLIER_RESPONSE")

# Evidence documents
for meta in glob.glob(
    os.path.join(root, "evidence", "*.metadata.json")
):
    try:
        d = json.load(open(meta))
    except Exception:
        continue

    if (
        d.get("verification", {}).get("state")
        != "VERIFIED"
    ):
        continue

    typ = str(d.get("type", "")).upper()

    if typ == "CGMP":
        typ = "GMP"

    if typ == "FORMULA_SPEC":
        typ = "FORMULA"

    verified.add(typ)

required = {
    "SUPPLIER_RESPONSE",
    "MANUFACTURER",
    "GMP",
    "COA",
    "LOT_TRACEABILITY",
    "QUOTE",
    "FORMULA",
}

missing = sorted(required - verified)

print(
    "VERIFIED="
    + (
        ",".join(sorted(verified))
        if verified
        else "NONE"
    )
)

print(
    "MISSING="
    + (
        ",".join(missing)
        if missing
        else "NONE"
    )
)

if missing:
    print("EVIDENCE_COMPLETE=NO")
    print("SUPPLIER_QUALIFIED=NO")
else:
    print("EVIDENCE_COMPLETE=YES")
    print("SUPPLIER_QUALIFIED=EVIDENCE_GATE_PASS")

# Qualification never implies purchase authority.
print("PROCUREMENT_AUTHORIZATION=FALSE")
print("PURCHASE_AUTHORIZATION=FALSE")
print("PO_SUBMISSION=DISABLED")
print("PAYMENT=DISABLED")
print("SALES=HARD_DISABLED")
PY
