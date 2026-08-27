#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private"
PROFILE="$PRIVATE/business-profile.json"
OUTREACH="$PRIVATE/outreach"
AUTH="$PRIVATE/transmission-authorizations"

cd "$PROJECT"

SUPPLIER="${1:-prohealth}"

RFQ="$OUTREACH/${SUPPLIER}-rfq.txt"

if [ "$SUPPLIER" = "prohealth" ]; then
  APP="$OUTREACH/prohealth-application-data.txt"
else
  APP=""
fi

[ -s "$RFQ" ] || {
  echo "FAIL: RFQ missing"
  exit 1
}

mkdir -p "$AUTH"
chmod 700 "$AUTH"

echo
echo "=============================================================="
echo " CIWU — HUMAN TRANSMISSION AUTHORIZATION"
echo "=============================================================="
echo
echo "Supplier: $SUPPLIER"
echo
echo "RFQ:"
echo "$RFQ"
echo
echo "SHA256:"
sha256sum "$RFQ"
echo

if [ -n "$APP" ] && [ -s "$APP" ]; then
  echo "Application preparation data:"
  echo "$APP"
  echo
  echo "SHA256:"
  sha256sum "$APP"
  echo
fi

echo "IMPORTANT:"
echo "This authorization DOES NOT send anything."
echo
echo "It only records that a human reviewed the packet"
echo "and authorized a later manual transmission."
echo

read -r -p \
"Type AUTHORIZE $SUPPLIER to certify human review: " CONFIRM

[ "$CONFIRM" = "AUTHORIZE $SUPPLIER" ] || {
  echo
  echo "AUTHORIZATION_NOT_GRANTED"
  exit 1
}

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$AUTH/${SUPPLIER}-${STAMP}.json"

RFQ_SHA="$(sha256sum "$RFQ" | awk '{print $1}')"

if [ -n "$APP" ] && [ -s "$APP" ]; then
  APP_SHA="$(sha256sum "$APP" | awk '{print $1}')"
else
  APP_SHA=""
fi

python - \
  "$FILE" \
  "$SUPPLIER" \
  "$RFQ_SHA" \
  "$APP_SHA" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

path, supplier, rfq_sha, app_sha = sys.argv[1:]

data = {
    "schema": "CIWU_M15_HUMAN_TRANSMISSION_AUTHORIZATION_V1",
    "supplier": supplier,
    "authorized_at": datetime.now(timezone.utc).isoformat(),
    "human_review": True,
    "rfq_sha256": rfq_sha,
    "application_sha256": app_sha or None,

    "authorization_scope": {
        "manual_supplier_transmission": True,
        "automatic_email_send": False,
        "automatic_application_submission": False,
        "quote_acceptance": False,
        "purchase_authorization": False,
        "po_submission": False,
        "payment": False,
        "sales": False
    }
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
echo "HUMAN_TRANSMISSION_REVIEW_AUTHORIZED"
echo "AUTHORIZATION=$FILE"
echo
echo "NO EMAIL HAS BEEN SENT"
echo "NO APPLICATION HAS BEEN SUBMITTED"
echo "NO PURCHASE HAS BEEN AUTHORIZED"
