#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
INBOX="$PROJECT/.ciwu-private/supplier-inbox"

SUPPLIER="${1:-}"
SOURCE="${2:-}"
TYPE="${3:-OTHER}"

[ -n "$SUPPLIER" ] || {
  echo "Usage: $0 supplier /path/to/file [TYPE]"
  exit 2
}

[ -f "$SOURCE" ] || {
  echo "FAIL: source file missing"
  exit 1
}

mkdir -p "$INBOX/$SUPPLIER"
chmod 700 "$INBOX" "$INBOX/$SUPPLIER"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="$(basename "$SOURCE")"
DEST="$INBOX/$SUPPLIER/${STAMP}-${BASE}"

cp -p "$SOURCE" "$DEST"
chmod 600 "$DEST"

HASH="$(sha256sum "$DEST" | awk '{print $1}')"

cat > "${DEST}.metadata.txt" <<EOF
supplier=$SUPPLIER
type=$TYPE
sha256=$HASH
received_at=$STAMP
verification_state=UNVERIFIED
procurement_authorization=false
EOF

chmod 600 "${DEST}.metadata.txt"

echo "SUPPLIER_RESPONSE_IMPORTED"
echo "FILE=$DEST"
echo "SHA256=$HASH"
echo "VERIFICATION_STATE=UNVERIFIED"
echo "PROCUREMENT_AUTHORIZATION=false"
