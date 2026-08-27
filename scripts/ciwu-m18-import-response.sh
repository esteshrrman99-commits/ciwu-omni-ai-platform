#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
TX_ID="CIWU-PROHEALTH-20260827T205926Z"

PRIVATE="$PROJECT/.ciwu-private"
PROVENANCE="$PRIVATE/transmission-evidence/$TX_ID/transmission-provenance.json"
DESTROOT="$PRIVATE/m18/responses"

SOURCE="${1:-}"

[ -f "$SOURCE" ] || {
    echo "USAGE:"
    echo "  $0 /path/to/real_supplier_reply"
    exit 2
}

[ -s "$PROVENANCE" ] || {
    echo "FAIL: outbound provenance missing"
    exit 1
}

mkdir -p "$DESTROOT"
chmod 700 "$DESTROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="$(basename "$SOURCE")"
DEST="$DESTROOT/${STAMP}-${BASE}"

cp -p "$SOURCE" "$DEST"
chmod 600 "$DEST"

HASH="$(sha256sum "$DEST" | awk '{print $1}')"

META="${DEST}.metadata.json"

python - \
    "$META" \
    "$DEST" \
    "$HASH" \
    "$PROVENANCE" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

meta, source, sha, provenance = sys.argv[1:]

with open(provenance, encoding="utf-8") as f:
    p = json.load(f)

if p["transmission_status"] != "SENT_EVIDENCE_RECORDED":
    raise SystemExit("OUTBOUND_PROVENANCE_NOT_CERTIFIED")

data = {
    "schema": "CIWU_M18_SUPPLIER_RESPONSE_V1",

    "transaction_id":
        p["transaction_id"],

    "supplier":
        p["supplier"],

    "recipient":
        p["recipient"],

    "response_artifact": {
        "path": source,
        "sha256": sha
    },

    "correlation": {
        "outbound_transaction_bound": True,
        "supplier_identity_verified": False
    },

    "verification": {
        "state": "INGESTED_UNVERIFIED",
        "reviewer": None,
        "reviewed_at": None
    },

    "commercial_effect": {
        "supplier_qualified": False,
        "purchase_authorized": False
    },

    "ingested_at":
        datetime.now(timezone.utc).isoformat()
}

tmp = meta + ".tmp"

with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")

os.chmod(tmp, 0o600)
os.replace(tmp, meta)
os.chmod(meta, 0o600)
PY

echo
echo "CIWU_M18_RESPONSE_IMPORTED"
echo "FILE=$DEST"
echo "SHA256=$HASH"
echo "STATE=INGESTED_UNVERIFIED"
echo "SUPPLIER_QUALIFIED=NO"
echo "PURCHASE_AUTHORIZATION=FALSE"
