'use strict';

const crypto =
  require('node:crypto');

function promote({
  fact,
  evidenceHash,
  confidence,
  certifiedTrial
}) {
  const c =
    Number(
      confidence
    );

  if (
    certifiedTrial !== true
  ) {
    return {
      promoted: false,
      reason:
        'CERTIFIED_TRIAL_REQUIRED'
    };
  }

  if (!evidenceHash) {
    return {
      promoted: false,
      reason:
        'EVIDENCE_REQUIRED'
    };
  }

  if (
    !Number.isFinite(c) ||
    c < 0.8 ||
    c > 1
  ) {
    return {
      promoted: false,
      reason:
        'CONFIDENCE_GATE'
    };
  }

  return {
    promoted: true,

    record: {
      id:
        crypto.randomUUID(),

      fact,
      evidenceHash,
      confidence:
        c,

      state:
        'ACTIVE',

      promotedAt:
        new Date()
          .toISOString()
    }
  };
}

function revoke(
  record,
  {
    evidenceInvalidated,
    regressionDetected,
    provenanceLost
  }
) {
  const reasons = [];

  if (evidenceInvalidated)
    reasons.push(
      'EVIDENCE_INVALIDATED'
    );

  if (regressionDetected)
    reasons.push(
      'REGRESSION_DETECTED'
    );

  if (provenanceLost)
    reasons.push(
      'PROVENANCE_LOST'
    );

  if (
    reasons.length === 0
  ) {
    return {
      revoked: false,
      record
    };
  }

  return {
    revoked: true,

    record: {
      ...record,
      state:
        'REVOKED',

      revokedAt:
        new Date()
          .toISOString(),

      revocationReasons:
        reasons
    }
  };
}

module.exports = {
  promote,
  revoke
};
