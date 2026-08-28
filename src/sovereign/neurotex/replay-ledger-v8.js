'use strict';

const crypto =
  require('node:crypto');

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function create() {
  const records=[];

  function append({
    experienceId,
    priorHash = null,
    evidenceHash,
    regressionHash,
    outcome
  }) {
    if (
      !experienceId ||
      !evidenceHash ||
      !regressionHash
    ) {
      throw new Error(
        'REPLAY_EVIDENCE_REQUIRED'
      );
    }

    const core={
      sequence:
        records.length + 1,

      experienceId,
      priorHash,
      evidenceHash,
      regressionHash,
      outcome,

      createdAt:
        new Date().toISOString()
    };

    const record={
      ...core,
      recordHash:
        digest(core)
    };

    records.push(record);

    return record;
  }

  function verify() {
    return records.every(
      r => {
        const copy={...r};
        delete copy.recordHash;

        return (
          digest(copy) ===
          r.recordHash
        );
      }
    );
  }

  function snapshot() {
    return records.map(
      r => ({...r})
    );
  }

  return {
    append,
    verify,
    snapshot
  };
}

module.exports = {
  digest,
  create
};
