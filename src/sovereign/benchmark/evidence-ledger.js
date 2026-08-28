'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function hash(
  value
) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function append(
  file,
  event
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

  const previous =
    read(file);

  const previousHash =
    previous.length
      ? previous[
          previous.length - 1
        ].recordHash
      : null;

  const base = {
    schema:
      'CIWU_BENCHMARK_EVIDENCE_V1',

    id:
      crypto.randomUUID(),

    createdAt:
      new Date()
        .toISOString(),

    previousHash,

    ...event
  };

  const record = {
    ...base,

    recordHash:
      hash(base)
  };

  fs.appendFileSync(
    target,
    JSON.stringify(
      record
    ) + '\n',
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(
    target,
    0o600
  );

  return record;
}

function read(
  file
) {
  if (!fs.existsSync(file))
    return [];

  return fs
    .readFileSync(
      file,
      'utf8'
    )
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
}

function verify(
  records
) {
  let previousHash =
    null;

  for (
    const record of
    records
  ) {
    const {
      recordHash,
      ...base
    } = record;

    if (
      base.previousHash !==
      previousHash
    ) {
      return false;
    }

    if (
      hash(base) !==
      recordHash
    ) {
      return false;
    }

    previousHash =
      recordHash;
  }

  return true;
}

module.exports = {
  hash,
  append,
  read,
  verify
};
