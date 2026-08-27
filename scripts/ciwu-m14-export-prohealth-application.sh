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

mkdir -p "$OUT"
chmod 700 "$OUT"

python - "$PROFILE" "$OUT" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

profile_path, out_dir = sys.argv[1:]

with open(profile_path, encoding="utf-8") as f:
    p = json.load(f)

path = os.path.join(out_dir, "prohealth-application-data.txt")

text = f"""CIWU — PROHEALTH APPLICATION PREPARATION DATA

Business / Applicant:
{p['business_display_name']}

Primary Contact:
{p['contact_name']}

Business Contact Email:
{p['supplier_contact_email']}

Phone:
{p.get('phone','')}

Requested Relationship:
Wholesale / Private Label / Co-branding / Custom Formulation Inquiry

Product Program:
CIWU Cellular Vitality

Product State:
DEVELOPMENT

Commercial Release:
BLOCKED

Procurement Authorization:
DISABLED

Application Submission:
NOT SUBMITTED

IMPORTANT:
This local preparation file intentionally does not contain an EIN,
tax identifier, payment credential, banking information, or other
high-risk identifier.

Generated:
{datetime.now(timezone.utc).isoformat()}
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

os.chmod(path, 0o600)
print(path)
PY

echo
echo "PROHEALTH_APPLICATION_EXPORT_COMPLETE"
echo "APPLICATION_SUBMISSION=DISABLED"
