'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ALLOWED = Object.freeze({
  groq: [
    'GROQ_API_KEY',
    'GROQ_MODEL'
  ],

  gemini: [
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GEMINI_MODEL'
  ],

  cloudflare: [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_MODEL'
  ],

  huggingface: [
    'HF_TOKEN',
    'HF_MODEL'
  ],

  openai: [
    'OPENAI_API_KEY',
    'OPENAI_MODEL'
  ],

  local: [
    'CIWU_LOCAL_MODEL_ENDPOINT',
    'CIWU_LOCAL_MODEL'
  ]
});

function fingerprint(value) {
  if (!value)
    return null;

  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .slice(0, 12);
}

function assertProvider(provider) {
  if (!(provider in ALLOWED))
    throw new Error(
      'UNKNOWN_PROVIDER'
    );
}

function secureWrite(file, object) {
  const target =
    path.resolve(file);

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
      mode: 0o700
    }
  );

  fs.writeFileSync(
    target,
    JSON.stringify(
      object,
      null,
      2
    ),
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(
    target,
    0o600
  );
}

function save({
  file,
  provider,
  values
}) {
  assertProvider(provider);

  const allowed =
    new Set(
      ALLOWED[provider]
    );

  const filtered = {};

  for (
    const [key,value] of
    Object.entries(values || {})
  ) {
    if (!allowed.has(key))
      continue;

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      filtered[key] =
        value.trim();
    }
  }

  if (!Object.keys(filtered).length)
    throw new Error(
      'NO_PROVIDER_VALUES'
    );

  let current = {};

  if (fs.existsSync(file)) {
    current =
      JSON.parse(
        fs.readFileSync(
          file,
          'utf8'
        ) || '{}'
      );
  }

  current[provider] =
    filtered;

  secureWrite(
    file,
    current
  );

  return {
    provider,

    fields:
      Object.keys(filtered),

    fingerprints:
      Object.fromEntries(
        Object.entries(filtered)
          .map(
            ([key,value]) => [
              key,
              fingerprint(value)
            ]
          )
      )
  };
}

function load({
  file,
  provider
}) {
  assertProvider(provider);

  if (!fs.existsSync(file))
    return {};

  const all =
    JSON.parse(
      fs.readFileSync(
        file,
        'utf8'
      ) || '{}'
    );

  return {
    ...(all[provider] || {})
  };
}

function inject({
  file,
  provider,
  target = process.env
}) {
  const values =
    load({
      file,
      provider
    });

  for (
    const [key,value] of
    Object.entries(values)
  ) {
    if (!target[key])
      target[key] = value;
  }

  return Object.keys(values);
}

function publicStatus({
  file,
  provider
}) {
  const values =
    load({
      file,
      provider
    });

  return {
    provider,

    configured:
      Object.keys(values)
        .length > 0,

    fields:
      Object.keys(values),

    fingerprints:
      Object.fromEntries(
        Object.entries(values)
          .map(
            ([key,value]) => [
              key,
              fingerprint(value)
            ]
          )
      )
  };
}

module.exports = {
  ALLOWED,
  fingerprint,
  secureWrite,
  save,
  load,
  inject,
  publicStatus
};
