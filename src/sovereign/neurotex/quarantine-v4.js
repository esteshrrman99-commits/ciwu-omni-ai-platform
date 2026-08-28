'use strict';

const crypto =
  require('node:crypto');

function quarantine({
  candidate,
  evidenceHash,
  confidence
}) {
  if (!evidenceHash) {
    throw new Error(
      'EVIDENCE_HASH_REQUIRED'
    );
  }

  const c =
    Number(confidence);

  if (
    !Number.isFinite(c) ||
    c < 0 ||
    c > 1
  ) {
    throw new Error(
      'CONFIDENCE_INVALID'
    );
  }

  return {
    id:
      crypto.randomUUID(),

    candidate,

    evidenceHash,

    confidence:
      c,

    state:
      'QUARANTINED',

    createdAt:
      new Date()
        .toISOString()
  };
}

function promote(
  record,
  {
    evidenceVerified,
    regressionPassed,
    provenanceValid,
    confidenceThreshold = 0.8
  }
) {
  if (
    record.state !==
    'QUARANTINED'
  ) {
    return {
      promoted: false,
      reason:
        'NOT_QUARANTINED'
    };
  }

  if (
    evidenceVerified !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'EVIDENCE_NOT_VERIFIED'
    };
  }

  if (
    regressionPassed !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'REGRESSION_NOT_PASSED'
    };
  }

  if (
    provenanceValid !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'PROVENANCE_INVALID'
    };
  }

  if (
    record.confidence <
    confidenceThreshold
  ) {
    return {
      promoted: false,
      reason:
        'CONFIDENCE_BELOW_THRESHOLD'
    };
  }

  return {
    promoted: true,

    record: {
      ...record,

      state:
        'ACTIVE',

      promotedAt:
        new Date()
          .toISOString()
    }
  };
}

module.exports = {
  quarantine,
  promote
};
