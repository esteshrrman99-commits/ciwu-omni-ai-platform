'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  task,
  provider,
  model,
  providerEvidenceHash,
  repairEvidenceHash,
  regressionPassed,
  confidence
}) {
  const c =
    Number(confidence);

  if (
    !providerEvidenceHash ||
    !repairEvidenceHash
  ) {
    throw new Error(
      'EVIDENCE_REQUIRED'
    );
  }

  if (
    regressionPassed !== true
  ) {
    throw new Error(
      'REGRESSION_REQUIRED'
    );
  }

  if (
    !Number.isFinite(c) ||
    c < 0 ||
    c > 1
  ) {
    throw new Error(
      'CONFIDENCE_INVALID'
    );
  }

  const state =
    c >= 0.8
      ? 'ACTIVE'
      : 'QUARANTINED';

  const base = {
    schema:
      'CIWU_CERTIFIED_EXPERIENCE_V5',

    experienceId:
      crypto.randomUUID(),

    task,
    provider,
    model,

    providerEvidenceHash,
    repairEvidenceHash,

    regressionPassed:
      true,

    confidence:
      c,

    state,

    createdAt:
      new Date()
        .toISOString()
  };

  return {
    ...base,
    experienceHash:
      hash(base)
  };
}

function promote(record) {
  if (
    record.state !==
    'QUARANTINED'
  ) {
    return record;
  }

  if (
    Number(record.confidence) <
    0.8
  ) {
    throw new Error(
      'CONFIDENCE_TOO_LOW_FOR_PROMOTION'
    );
  }

  return {
    ...record,
    state:
      'ACTIVE',

    promotedAt:
      new Date()
        .toISOString()
  };
}

module.exports = {
  hash,
  create,
  promote
};
