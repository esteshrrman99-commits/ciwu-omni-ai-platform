'use strict';

function evaluate({
  providerCertified,
  receiptVerified,
  benchmarkVerified,
  priceFresh,
  costReconciled,
  circuitOpen,
  evidenceStale,
  benchmarkScore,
  minimumScore = 0.70
}) {
  const reasons = [];

  if (!providerCertified)
    reasons.push(
      'PROVIDER_NOT_CERTIFIED'
    );

  if (!receiptVerified)
    reasons.push(
      'RECEIPT_NOT_VERIFIED'
    );

  if (!benchmarkVerified)
    reasons.push(
      'BENCHMARK_NOT_VERIFIED'
    );

  if (!priceFresh)
    reasons.push(
      'PRICE_NOT_FRESH'
    );

  if (!costReconciled)
    reasons.push(
      'COST_NOT_RECONCILED'
    );

  if (circuitOpen)
    reasons.push(
      'CIRCUIT_OPEN'
    );

  if (evidenceStale)
    reasons.push(
      'EVIDENCE_STALE'
    );

  const score =
    Number(benchmarkScore);

  if (
    !Number.isFinite(score)
  ) {
    reasons.push(
      'BENCHMARK_SCORE_INVALID'
    );
  } else if (
    score <
    Number(minimumScore)
  ) {
    reasons.push(
      'BENCHMARK_SCORE_BELOW_THRESHOLD'
    );
  }

  return {
    admitted:
      reasons.length === 0,

    reasons,

    benchmarkScore:
      Number.isFinite(score)
        ? score
        : null
  };
}

module.exports = {
  evaluate
};
