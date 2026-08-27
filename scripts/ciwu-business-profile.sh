#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private"
PROFILE="$PRIVATE/business-profile.json"

cd "$PROJECT"

mkdir -p "$PRIVATE"
chmod 700 "$PRIVATE"

read_value() {
  local label="$1"
  local existing="${2:-}"

  if [ -n "$existing" ]; then
    printf '%s [%s]: ' "$label" "$existing"
  else
    printf '%s: ' "$label"
  fi

  IFS= read -r value

  if [ -z "$value" ]; then
    value="$existing"
  fi

  printf '%s' "$value"
}

if [ -f "$PROFILE" ]; then
  CURRENT="$PROFILE"
else
  CURRENT=""
fi

get_current() {
  local key="$1"

  if [ -n "$CURRENT" ]; then
    python - "$CURRENT" "$key" <<'PY'
import json, sys

path, key = sys.argv[1:]
try:
    data = json.load(open(path))
    value = data.get(key, "")
    if value is None:
        value = ""
    elif isinstance(value, bool):
        value = "YES" if value else "NO"
    elif isinstance(value, list):
        value = ", ".join(str(x) for x in value)
    print(value, end="")
except Exception:
    pass
PY
  fi
}

echo
echo "=============================================================="
echo " CIWU LOCAL BUSINESS PROFILE"
echo "=============================================================="
echo
echo "This profile remains LOCAL ONLY:"
echo "  $PROFILE"
echo
echo "It is excluded from Git and Render."
echo

company_name="$(
  read_value \
    "Company name" \
    "$(get_current company_name)"
)"

contact_name="$(
  read_value \
    "Contact name" \
    "$(get_current contact_name)"
)"

title="$(
  read_value \
    "Title" \
    "$(get_current title)"
)"

address="$(
  read_value \
    "Address" \
    "$(get_current address)"
)"

city="$(
  read_value \
    "City" \
    "$(get_current city)"
)"

state="$(
  read_value \
    "State" \
    "$(get_current state)"
)"

zip_code="$(
  read_value \
    "ZIP code" \
    "$(get_current zip_code)"
)"

country="$(
  read_value \
    "Country" \
    "$(get_current country)"
)"

[ -n "$country" ] || country="USA"

phone_number="$(
  read_value \
    "Business phone" \
    "$(get_current phone_number)"
)"

email_address="$(
  read_value \
    "Business email" \
    "$(get_current email_address)"
)"

website="$(
  read_value \
    "Business website" \
    "$(get_current website)"
)"

type_of_business="$(
  read_value \
    "Type of business" \
    "$(get_current type_of_business)"
)"

year_established="$(
  read_value \
    "Year established" \
    "$(get_current year_established)"
)"

practitioner_office="$(
  read_value \
    "Practitioner office? YES/NO" \
    "$(get_current practitioner_office)"
)"

intended_sales_channels="$(
  read_value \
    "Intended sales channels" \
    "$(get_current intended_sales_channels)"
)"

products_of_interest="$(
  read_value \
    "Products of interest" \
    "$(get_current products_of_interest)"
)"

expected_monthly_volume="$(
  read_value \
    "Expected monthly volume" \
    "$(get_current expected_monthly_volume)"
)"

additional_business_information="$(
  read_value \
    "Additional business information" \
    "$(get_current additional_business_information)"
)"

export company_name
export contact_name
export title
export address
export city
export state
export zip_code
export country
export phone_number
export email_address
export website
export type_of_business
export year_established
export practitioner_office
export intended_sales_channels
export products_of_interest
export expected_monthly_volume
export additional_business_information

python <<'PY'
import json
import os
from pathlib import Path

path = Path(
    os.path.expanduser(
        "~/ciwu-omni-ai-platform/.ciwu-private/business-profile.json"
    )
)

keys = [
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

data = {
    key: os.environ.get(key, "").strip()
    for key in keys
}

missing = [
    key
    for key, value in data.items()
    if not value
]

data["_profile_state"] = (
    "COMPLETE"
    if not missing
    else "INCOMPLETE"
)

data["_missing_fields"] = missing

path.write_text(
    json.dumps(data, indent=2) + "\n"
)

os.chmod(path, 0o600)

print()
print("PROFILE_STATE=" + data["_profile_state"])

if missing:
    print(
        "MISSING_FIELDS="
        + ",".join(missing)
    )
else:
    print("MISSING_FIELDS=NONE")

print("PROFILE=" + str(path))
PY

echo
echo "✓ LOCAL BUSINESS PROFILE SAVED"
