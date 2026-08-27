#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

META="${1:-}"

[ -s "$META" ] || {
    echo "USAGE:"
    echo "  $0 /path/to/*.metadata.json"
    exit 2
}

python - "$META" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as f:
    d = json.load(f)

print()
print("TYPE:", d.get("type", "SUPPLIER_RESPONSE"))
print("SUPPLIER:", d.get("supplier"))
print("STATE:", d.get("verification", {}).get("state"))
print()

artifact = (
    d.get("artifact")
    or d.get("response_artifact")
    or {}
)

print("ARTIFACT:", artifact.get("path"))
print("SHA256:", artifact.get("sha256"))
PY

echo
echo "Review the ACTUAL underlying artifact before verification."
echo
echo "Verification does not authorize purchasing."
echo

read -r -p \
"Type VERIFIED only after actual human evidence review: " DECISION

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
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

path, reviewer = sys.argv[1:]

with open(path, encoding="utf-8") as f:
    d = json.load(f)

artifact = (
    d.get("artifact")
    or d.get("response_artifact")
)

if not artifact:
    raise SystemExit("ARTIFACT_BINDING_MISSING")

source = artifact["path"]
expected = artifact["sha256"]

h = hashlib.sha256()

with open(source, "rb") as f:
    for block in iter(
        lambda: f.read(1024 * 1024),
        b""
    ):
        h.update(block)

if h.hexdigest() != expected:
    raise SystemExit("SHA256_BINDING_FAILURE")

d["verification"] = {
    "state": "VERIFIED",
    "reviewer": reviewer,
    "reviewed_at":
        datetime.now(timezone.utc).isoformat()
}

if "correlation" in d:
    d["correlation"]["supplier_identity_verified"] = True

d["commercial_effect"] = {
    "supplier_qualified": False,
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

echo
echo "EVIDENCE_VERIFICATION=PASS"
echo "HASH_BINDING=PASS"
echo "PURCHASE_AUTHORIZATION=FALSE"
