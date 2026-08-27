#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private"
PROFILE="$PRIVATE/business-profile.json"
EXPORTS="$PRIVATE/exports"

cd "$PROJECT"

[ -s "$PROFILE" ] || {
  echo "FAIL: local business profile missing."
  echo
  echo "Run:"
  echo "  ./scripts/ciwu-business-profile.sh"
  exit 1
}

mkdir -p "$EXPORTS"
chmod 700 "$EXPORTS"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

OUT_JSON="$EXPORTS/prohealth-wholesale-application-${STAMP}.json"
OUT_TXT="$EXPORTS/prohealth-wholesale-application-${STAMP}.txt"

python - "$PROFILE" "$OUT_JSON" "$OUT_TXT" <<'PY'
import json
import sys
from pathlib import Path

profile_path, out_json, out_txt = map(Path, sys.argv[1:])

profile = json.load(open(profile_path))

required = [
    "company_name",
    "contact_name",
    "title",
    "address",
    "city",
    "state",
    "zip_code",
    "country",
    "phone_number",
    "email_address",
    "website",
    "type_of_business",
    "year_established",
    "practitioner_office",
    "intended_sales_channels",
    "products_of_interest",
    "expected_monthly_volume",
    "additional_business_information",
]

missing = [
    field
    for field in required
    if not str(profile.get(field, "")).strip()
]

if missing:
    print(
        "FAIL: application profile incomplete:"
    )

    for field in missing:
        print("  - " + field)

    raise SystemExit(2)

application = {
    "supplier": "ProHealth Longevity",
    "application_url":
        "https://www.prohealth.com/pages/wholesale-application",
    "state": "READY_FOR_HUMAN_SUBMISSION",
    "submission_performed": False,
    "fields": {
        field: profile[field]
        for field in required
    },
}

out_json.write_text(
    json.dumps(application, indent=2) + "\n"
)

lines = [
    "CIWU / PROHEALTH WHOLESALE APPLICATION",
    "",
    "STATE: READY FOR HUMAN SUBMISSION",
    "AUTOMATIC SUBMISSION: DISABLED",
    "",
]

labels = {
    "company_name": "Company Name",
    "contact_name": "Contact Name",
    "title": "Title",
    "address": "Address",
    "city": "City",
    "state": "State",
    "zip_code": "ZIP Code",
    "country": "Country",
    "phone_number": "Phone Number",
    "email_address": "Email Address",
    "website": "Website",
    "type_of_business": "Type of Business",
    "year_established": "Year Established",
    "practitioner_office": "Practitioner Office",
    "intended_sales_channels": "Intended Sales Channels",
    "products_of_interest": "Products of Interest",
    "expected_monthly_volume": "Expected Monthly Volume",
    "additional_business_information":
        "Additional Business Information",
}

for field in required:
    lines.append(
        f"{labels[field]}: {profile[field]}"
    )

lines.extend([
    "",
    "Official application:",
    "https://www.prohealth.com/pages/wholesale-application",
    "",
    "Wholesale:",
    "wholesale@prohealth.com",
    "(805) 679-6982",
    "",
    "This export DOES NOT submit the application."
])

out_txt.write_text(
    "\n".join(lines) + "\n"
)

print("APPLICATION_JSON=" + str(out_json))
print("APPLICATION_TEXT=" + str(out_txt))
print("APPLICATION_STATE=READY_FOR_HUMAN_SUBMISSION")
PY

chmod 600 \
  "$OUT_JSON" \
  "$OUT_TXT"

echo "✓ PROHEALTH APPLICATION EXPORT PASS"
