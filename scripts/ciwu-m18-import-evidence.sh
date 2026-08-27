#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
TX_ID="CIWU-PROHEALTH-20260827T205926Z"

PRIVATE="$PROJECT/.ciwu-private"
DESTROOT="$PRIVATE/m18/evidence"

SOURCE="${1:-}"
TYPE="${2:-}"
LOT="${3:-NONE}"

[ -f "$SOURCE" ] || {
    echo "USAGE:"
    echo "  $0 /path/to/document TYPE [LOT]"
    echo
    echo "TYPE:"
    echo "  MANUFACTURER"
    echo "  GMP"
    echo "  COA"
    echo "  LOT_TRACEABILITY"
    echo "  QUOTE"
    echo "  FORMULA"
    echo "  OTHER"
    exit 2
}

case "$TYPE" in
    MANUFACTURER|GMP|CGMP|COA|LOT_TRACEABILITY|QUOTE|FORMULA|FORMULA_SPEC|OTHER)
        ;;
    *)
        echo "FAIL: unsupported evidence type"
        exit 1
        ;;
esac

mkdir -p "$DESTROOT"
chmod 700 "$DESTROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="$(basename "$SOURCE")"
DEST="$DESTROOT/${STAMP}-${TYPE}-${BASE}"

cp -p "$SOURCE" "$DEST"
chmod 600 "$DEST"

HASH="$(sha256sum "$DEST" | awk '{print $1}')"
SIZE="$(stat -c '%s' "$DEST")"

META="${DEST}.metadata.json"

python - \
    "$META" \
    "$TX_ID" \
    "$TYPE" \
    "$LOT" \
    "$DEST" \
    "$HASH" \
    "$SIZE" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

meta, txid, typ, lot, path, sha, size = sys.argv[1:]

data = {
    "schema": "CIWU_M18_EVIDENCE_V1",

    "transaction_id": txid,
    "supplier": "ProHealth",

    "type": typ,
    "lot": None if lot == "NONE" else lot,

    "artifact": {
        "path": path,
        "sha256": sha,
        "size_bytes": int(size)
    },

    "state":
        "INGESTED_UNVERIFIED",

    "verification": {
        "state": "UNVERIFIED",
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
echo "CIWU_M18_EVIDENCE_IMPORTED"
echo "TYPE=$TYPE"
echo "LOT=$LOT"
echo "SHA256=$HASH"
echo "STATE=INGESTED_UNVERIFIED"
echo "PURCHASE_AUTHORIZATION=FALSE"
