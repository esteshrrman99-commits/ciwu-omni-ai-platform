#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
cd "$PROJECT" || exit 1

PROVIDER="${1:-}"

case "$PROVIDER" in
  groq|gemini|cloudflare|huggingface|openai|local)
    ;;
  *)
    echo "Usage:"
    echo "  ./scripts/sovereign/onboard-provider.sh <provider>"
    exit 2
    ;;
esac

PRIVATE="$PROJECT/.ciwu-private"
VAULT="$PRIVATE/provider-vault.json"

mkdir -p "$PRIVATE"
chmod 700 "$PRIVATE"

tmp="$(mktemp)"

cleanup() {
  rm -f "$tmp"
}
trap cleanup EXIT

printf '{' > "$tmp"

add_value() {
  local name="$1"
  local secret="${2:-true}"
  local value=""

  if [ "$secret" = "true" ]; then
    read -rsp "$name: " value
    echo
  else
    read -rp "$name: " value
  fi

  if [ -n "$value" ]; then
    python - "$tmp" "$name" "$value" <<'PY'
import json
import sys
from pathlib import Path

p=Path(sys.argv[1])
key=sys.argv[2]
value=sys.argv[3]

raw=p.read_text()
if raw == "{":
    obj={}
else:
    obj=json.loads(raw)

obj[key]=value
p.write_text(
    json.dumps(obj),
    encoding="utf-8"
)
PY
  fi
}

case "$PROVIDER" in
  groq)
    add_value GROQ_API_KEY true
    add_value GROQ_MODEL false
    ;;

  gemini)
    add_value GEMINI_API_KEY true
    add_value GEMINI_MODEL false
    ;;

  cloudflare)
    add_value CLOUDFLARE_API_TOKEN true
    add_value CLOUDFLARE_ACCOUNT_ID true
    add_value CLOUDFLARE_MODEL false
    ;;

  huggingface)
    add_value HF_TOKEN true
    add_value HF_MODEL false
    ;;

  openai)
    add_value OPENAI_API_KEY true
    add_value OPENAI_MODEL false
    ;;

  local)
    add_value CIWU_LOCAL_MODEL_ENDPOINT false
    add_value CIWU_LOCAL_MODEL false
    ;;
esac

node - "$VAULT" "$PROVIDER" "$tmp" <<'NODE'
const fs = require('node:fs');

const [
  vault,
  provider,
  tmp
] = process.argv.slice(2);

const {
  save
} = require(
  './src/sovereign/vault/provider-vault'
);

const values =
  JSON.parse(
    fs.readFileSync(
      tmp,
      'utf8'
    )
  );

const result =
  save({
    file: vault,
    provider,
    values
  });

console.log(
  'PROVIDER=' +
  result.provider
);

console.log(
  'FIELDS=' +
  result.fields.join(',')
);

console.log(
  'SECRET_VALUES_PRINTED=NO'
);

console.log(
  'PROVIDER_VAULT_SAVE=PASS'
);
NODE

chmod 600 "$VAULT"

echo "VAULT=$VAULT"
echo "MODE=$(stat -c '%a' "$VAULT")"
