#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"
export PREFIX="/data/data/com.termux/files/usr"
export TMPDIR="$PREFIX/tmp"

PROJECT="$HOME/ciwu-omni-ai-platform"
cd "$PROJECT" || exit 1

VAULT="$PROJECT/.ciwu-private/provider-vault"
mkdir -p "$VAULT"
chmod 700 "$VAULT"

printf 'Provider: '
IFS= read -r PROVIDER

printf 'Preferred model (optional): '
IFS= read -r MODEL

printf 'API secret/token: '
IFS= read -r -s SECRET
printf '\n'

if [ -z "$SECRET" ]; then
    echo "ONBOARDING=ABSTAIN"
    echo "REASON=SECRET_REQUIRED"
    exit 1
fi

PROVIDER="$PROVIDER" \
MODEL="$MODEL" \
SECRET="$SECRET" \
VAULT="$VAULT" \
node <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const {
  createRecord,
  saveMetadata
} = require(
  './src/sovereign/provider-runtime/onboarding'
);

const provider =
  process.env.PROVIDER;

const model =
  process.env.MODEL || null;

const secret =
  process.env.SECRET;

const vault =
  process.env.VAULT;

const record =
  createRecord({
    provider,
    secret,
    model
  });

const secretFile =
  path.join(
    vault,
    `${record.provider}.secret`
  );

fs.writeFileSync(
  secretFile,
  secret,
  {
    encoding: 'utf8',
    mode: 0o600
  }
);

fs.chmodSync(
  secretFile,
  0o600
);

saveMetadata(
  path.join(
    vault,
    `${record.provider}.metadata.json`
  ),
  record
);

console.log(
  'PROVIDER=' +
  record.provider
);

console.log(
  'SECRET_STORED=PRIVATE_LOCAL_ONLY'
);

console.log(
  'SECRET_PRINTED=NO'
);

console.log(
  'INFERENCE_CERTIFIED=NO'
);

console.log(
  'COST_CERTIFIED=NO'
);

console.log(
  'PAID_AUTHORIZATION=FALSE'
);
NODE

unset SECRET
