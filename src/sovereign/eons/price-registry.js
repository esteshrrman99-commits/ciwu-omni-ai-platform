'use strict';

const fs = require('node:fs');
const path = require('node:path');

function parseTime(value) {
  const n = Date.parse(value);

  if (!Number.isFinite(n))
    throw new Error(
      'INVALID_TIMESTAMP'
    );

  return n;
}

function isFresh(
  entry,
  {
    now = Date.now(),
    maxAgeMs = 7 * 24 * 60 * 60 * 1000
  } = {}
) {
  if (!entry)
    return false;

  if (!entry.lastVerifiedAt)
    return false;

  const verified =
    parseTime(
      entry.lastVerifiedAt
    );

  return (
    now - verified <=
    maxAgeMs
  );
}

function validateEntry(entry) {
  if (!entry.provider)
    throw new Error(
      'PROVIDER_REQUIRED'
    );

  if (!entry.model)
    throw new Error(
      'MODEL_REQUIRED'
    );

  if (
    ![
      'ZERO_VERIFIED',
      'PAID',
      'UNKNOWN'
    ].includes(
      entry.costClass
    )
  ) {
    throw new Error(
      'INVALID_COST_CLASS'
    );
  }

  if (!entry.source)
    throw new Error(
      'PRICE_SOURCE_REQUIRED'
    );

  parseTime(
    entry.lastVerifiedAt
  );

  return true;
}

function save(file, entries) {
  for (const entry of entries)
    validateEntry(entry);

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
      {
        schema:
          'CIWU_PRICE_REGISTRY_V1',
        entries
      },
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

function load(file) {
  if (!fs.existsSync(file))
    return [];

  const data =
    JSON.parse(
      fs.readFileSync(
        file,
        'utf8'
      )
    );

  return Array.isArray(
    data.entries
  )
    ? data.entries
    : [];
}

module.exports = {
  isFresh,
  validateEntry,
  save,
  load
};
