'use strict';

function certify({
  provider,
  model,
  realResponseCertified,
  costReconciled,
  priceEvidenceFresh,
  benchmarkScore,
  evidenceHash
}) {
  if (
    realResponseCertified !==
    true
  ) {
    return {
      certified: false,
      reason:
        'REAL_RESPONSE_NOT_CERTIFIED'
    };
  }

  if (
    costReconciled !==
    true
  ) {
    return {
      certified: false,
      reason:
        'COST_NOT_RECONCILED'
    };
  }

  if (
    priceEvidenceFresh !==
    true
  ) {
    return {
      certified: false,
      reason:
        'PRICE_EVIDENCE_NOT_FRESH'
    };
  }

  const score =
    Number(
      benchmarkScore
    );

  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score > 1
  ) {
    return {
      certified: false,
      reason:
        'BENCHMARK_SCORE_INVALID'
    };
  }

  if (!evidenceHash) {
    return {
      certified: false,
      reason:
        'EVIDENCE_HASH_REQUIRED'
    };
  }

  return {
    certified: true,

    entry: {
      provider,
      model,
      benchmarkScore:
        score,

      evidenceHash,

      runtimeEligible:
        true,

      certifiedAt:
        new Date()
          .toISOString()
    }
  };
}

function runtimeEligible(
  entry
) {
  return (
    entry &&
    entry.runtimeEligible ===
      true &&
    Boolean(
      entry.evidenceHash
    )
  );
}

module.exports = {
  certify,
  runtimeEligible
};
