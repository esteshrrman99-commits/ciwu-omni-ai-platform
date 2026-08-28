'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function createLedger() {
  const records = [];

  function append(record) {
    if (!record?.telemetryHash) {
      throw new Error(
        'TELEMETRY_HASH_REQUIRED'
      );
    }

    const previousHash =
      records.length
        ? records[
            records.length - 1
          ].entryHash
        : null;

    const base = {
      sequence:
        records.length + 1,

      previousHash,

      telemetryHash:
        record.telemetryHash,

      provider:
        record.provider,

      model:
        record.model,

      recordedAt:
        record.recordedAt
    };

    const entry = {
      ...base,
      entryHash:
        hash(base)
    };

    records.push(entry);

    return entry;
  }

  function verify() {
    let previous = null;

    for (
      let i = 0;
      i < records.length;
      i += 1
    ) {
      const entry =
        records[i];

      if (
        entry.sequence !==
        i + 1
      ) {
        return false;
      }

      if (
        entry.previousHash !==
        previous
      ) {
        return false;
      }

      const copy = {
        ...entry
      };

      delete copy.entryHash;

      if (
        hash(copy) !==
        entry.entryHash
      ) {
        return false;
      }

      previous =
        entry.entryHash;
    }

    return true;
  }

  function list() {
    return records.map(
      record => ({
        ...record
      })
    );
  }

  return {
    append,
    verify,
    list
  };
}

module.exports = {
  hash,
  createLedger
};
