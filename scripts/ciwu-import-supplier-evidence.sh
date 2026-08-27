#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private"
INDEX="$PRIVATE/evidence/evidence-index.ndjson"

cd "$PROJECT"

SUPPLIER_ID="${1:-}"
FILE="${2:-}"
TYPE="${3:-}"

[ -n "$SUPPLIER_ID" ] || {
  echo "USAGE:"
  echo "  $0 SUPPLIER_ID FILE DOCUMENT_TYPE"
  exit 1
}

[ -f "$FILE" ] || {
  echo "FAIL: evidence file missing"
  exit 1
}

[ -n "$TYPE" ] || {
  echo "FAIL: document type required"
  exit 1
}

mkdir -p "$(dirname "$INDEX")"

HASH="$(
  sha256sum "$FILE" |
    awk '{print $1}'
)"

SIZE="$(
  stat -c '%s' "$FILE"
)"

ABS="$(
  python - "$FILE" <<'PY'
import os, sys
print(os.path.abspath(sys.argv[1]))
PY
)"

export SUPPLIER_ID
export ABS
export TYPE
export HASH
export SIZE

python >> "$INDEX" <<'PY'
import json
import os
from datetime import datetime, timezone

record = {
    "supplier_id":
        os.environ["SUPPLIER_ID"],

    "local_path":
        os.environ["ABS"],

    "document_type":
        os.environ["TYPE"],

    "sha256":
        os.environ["HASH"],

    "size_bytes":
        int(os.environ["SIZE"]),

    "intake_state":
        "INDEXED_UNVERIFIED",

    "verified":
        False,

    "timestamp":
        datetime.now(
            timezone.utc
        ).isoformat()
}

print(json.dumps(record))
PY

chmod 600 "$INDEX"

echo "SUPPLIER=$SUPPLIER_ID"
echo "DOCUMENT=$ABS"
echo "TYPE=$TYPE"
echo "SHA256=$HASH"
echo "STATE=INDEXED_UNVERIFIED"
echo
echo "✓ LOCAL EVIDENCE INDEX PASS"
echo "NOTE: source file was NOT duplicated."
