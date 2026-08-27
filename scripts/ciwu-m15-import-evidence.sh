#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
INBOX="$PROJECT/.ciwu-private/supplier-inbox"

SUPPLIER="${1:-}"
SOURCE="${2:-}"
TYPE="${3:-OTHER}"
LOT="${4:-NONE}"

[ -n "$SUPPLIER" ] || {
  echo "Usage:"
  echo "$0 supplier /path/to/document TYPE [LOT]"
  exit 2
}

[ -f "$SOURCE" ] || {
  echo "FAIL: document missing"
  exit 1
}

DESTDIR="$INBOX/$SUPPLIER"

mkdir -p "$DESTDIR"
chmod 700 "$INBOX" "$DESTDIR"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="$(basename "$SOURCE")"
DEST="$DESTDIR/${STAMP}-${BASE}"

cp -p "$SOURCE" "$DEST"
chmod 600 "$DEST"

HASH="$(sha256sum "$DEST" | awk '{print $1}')"

META="${DEST}.metadata.json"

python - \
 "$META" \
 "$SUPPLIER" \
 "$TYPE" \
 "$LOT" \
 "$DEST" \
 "$HASH" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

meta, supplier, typ, lot, path, sha = sys.argv[1:]

data = {
    "schema": "CIWU_M15_EVIDENCE_V1",
    "supplier": supplier,
    "evidence_type": typ,
    "lot": None if lot == "NONE" else lot,
    "file": path,
    "sha256": sha,
    "received_at": datetime.now(timezone.utc).isoformat(),

    "verification": {
        "state": "UNVERIFIED",
        "reviewer": None,
        "reviewed_at": None
    },

    "commercial_effect": {
        "supplier_qualified": False,
        "procurement_authorized": False,
        "purchase_authorized": False
    }
}

with open(meta, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")

os.chmod(meta, 0o600)
PY

echo
echo "CIWU_EVIDENCE_IMPORTED"
echo "SUPPLIER=$SUPPLIER"
echo "TYPE=$TYPE"
echo "LOT=$LOT"
echo "SHA256=$HASH"
echo "STATE=UNVERIFIED"
