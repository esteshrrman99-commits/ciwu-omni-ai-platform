'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  describe
} = require(
  '../security/secret-envelope'
);

const PROVIDERS =
  Object.freeze([
    'openai',
    'groq',
    'gemini',
    'cloudflare',
    'huggingface',
    'local'
  ]);

function normalizeProvider(
  provider
) {
  const value =
    String(
      provider || ''
    )
    .trim()
    .toLowerCase();

  if (
    !PROVIDERS.includes(
      value
    )
  ) {
    throw new Error(
      'UNSUPPORTED_PROVIDER'
    );
  }

  return value;
}

function createRecord({
  provider,
  secret,
  accountId = null,
  model = null
}) {
  const id =
    normalizeProvider(
      provider
    );

  const record = {
    schema:
      'CIWU_PROVIDER_ONBOARDING_V1',

    provider:
      id,

    secret:
      describe(
        secret
      ),

    accountIdPresent:
      Boolean(
        accountId
      ),

    preferredModel:
      model || null,

    configuredAt:
      new Date()
        .toISOString(),

    inferenceCertified:
      false,

    costCertified:
      false,

    paidAuthorization:
      false
  };

  return record;
}

function saveMetadata(
  file,
  record
) {
  const target =
    path.resolve(file);

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
      mode: 0o700
    }
  );

  const safe = {
    ...record,
    secret: {
      ...record.secret,
      value:
        '[REDACTED]'
    }
  };

  fs.writeFileSync(
    target,
    JSON.stringify(
      safe,
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

  return target;
}

module.exports = {
  PROVIDERS,
  normalizeProvider,
  createRecord,
  saveMetadata
};
