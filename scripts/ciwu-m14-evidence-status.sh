#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
INBOX="$PROJECT/.ciwu-private/supplier-inbox"

echo "=============================================================="
echo " CIWU M14 — PRIVATE SUPPLIER EVIDENCE CONSOLE"
echo "=============================================================="

if [ ! -d "$INBOX" ]; then
  echo "Responses received: 0"
  echo "Verified supplier: NONE"
  echo "Qualification: BLOCKED"
  exit 0
fi

COUNT="$(find "$INBOX" -type f ! -name '*.metadata.txt' | wc -l)"

echo "Responses received: $COUNT"
echo

find "$INBOX" -type f -name '*.metadata.txt' -print |
while read -r META; do
  echo "--------------------------------------------------------------"
  cat "$META"
done

echo
echo "NOTE:"
echo "Imported evidence remains UNVERIFIED until explicit human"
echo "review and a separate adjudication step."
echo
echo "PURCHASE_AUTHORIZATION=DISABLED"
echo "SALES=HARD_DISABLED"
