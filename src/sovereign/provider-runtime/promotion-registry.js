'use strict';

function promote({
  provider,
  model,
  inferenceCertified,
  costCertified,
  costClass,
  evidenceHash,
  benchmarkScore
}) {
  if (
    inferenceCertified !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'INFERENCE_NOT_CERTIFIED'
    };
  }

  if (
    costCertified !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'COST_NOT_CERTIFIED'
    };
  }

  if (
    ![
      'ZERO_VERIFIED',
      'PAID'
    ].includes(
      costClass
    )
  ) {
    return {
      promoted: false,
      reason:
        'COST_CLASS_NOT_CERTIFIED'
    };
  }

  if (!evidenceHash) {
    return {
      promoted: false,
      reason:
        'EVIDENCE_HASH_REQUIRED'
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
      promoted: false,
      reason:
        'BENCHMARK_SCORE_INVALID'
    };
  }

  return {
    promoted: true,

    entry: {
      provider,
      model,
      costClass,
      evidenceHash,
      benchmarkScore:
        score,

      runtimeEligible:
        true,

      promotedAt:
        new Date()
          .toISOString()
    }
  };
}

module.exports = {
  promote
};
