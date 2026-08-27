#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PROFILE="$PROJECT/.ciwu-private/business-profile.json"
OUT="$PROJECT/.ciwu-private/outreach"

cd "$PROJECT"

[ -f "$PROFILE" ] || {
  echo "FAIL: private business profile missing"
  exit 1
}

SUPPLIER="${1:-prohealth}"
QTY="${2:-1000}"

mkdir -p "$OUT"
chmod 700 "$OUT"

python - "$PROFILE" "$OUT" "$SUPPLIER" "$QTY" <<'PY'
import json
import os
import re
import sys
from datetime import datetime, timezone

profile_path, out_dir, supplier, qty = sys.argv[1:]

with open(profile_path, encoding="utf-8") as f:
    p = json.load(f)

slug = re.sub(r"[^a-z0-9_-]+", "-", supplier.lower()).strip("-")
path = os.path.join(out_dir, f"{slug}-rfq.txt")

text = f"""CIWU SUPPLIER REQUEST FOR QUOTATION

Supplier:
{supplier}

Requested initial quantity:
{qty}

Applicant / Business:
{p['business_display_name']}

Contact:
{p['contact_name']}

Reply email:
{p['supplier_contact_email']}

Phone:
{p.get('phone','')}

REQUEST

Please provide information applicable to an NMN/private-label
finished-product program, including:

1. Available NMN finished-product/private-label configurations.
2. Minimum order quantity and quantity price tiers.
3. Ingredient/formula specification.
4. Serving size and dosage options.
5. Manufacturing facility identity.
6. Current GMP documentation applicable to the manufacturing site.
7. Example or lot-specific COA documentation.
8. Raw-material identity/purity testing information.
9. Finished-product testing specifications.
10. Packaging and labeling options.
11. Lead time.
12. Payment terms.
13. Private-label/co-brand/custom-formulation requirements.
14. Any onboarding/application requirements.
15. Shipping/freight terms.

CIWU EVIDENCE POLICY

No public marketing claim, advertised MOQ, certificate claim,
or pricing statement will be treated as verified procurement
evidence until the applicable documentation or supplier response
is received and reviewed.

STATUS

This document is an RFQ draft/export.
It does not constitute a purchase order, acceptance, payment,
or authorization to manufacture.

Generated:
{datetime.now(timezone.utc).isoformat()}
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

os.chmod(path, 0o600)

print(path)
PY

echo
echo "RFQ_EXPORT_COMPLETE"
echo "EMAIL_SEND=DISABLED"
echo "PO_SUBMISSION=DISABLED"
