'use strict';

function assess({
  receiptValid,
  priceFresh,
  benchmarkFresh,
  circuitOpen,
  recentFailureRate,
  maximumFailureRate = 0.5
}) {
  const reasons = [];

  if (receiptValid !== true)
    reasons.push(
      'RECEIPT_INVALID'
    );

  if (priceFresh !== true)
    reasons.push(
      'PRICE_STALE'
    );

  if (benchmarkFresh !== true)
    reasons.push(
      'BENCHMARK_STALE'
    );

  if (circuitOpen === true)
    reasons.push(
      'CIRCUIT_OPEN'
    );

  const rate =
    Number(recentFailureRate);

  if (
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 1
  ) {
    reasons.push(
      'FAILURE_RATE_INVALID'
    );
  } else if (
    rate >
    Number(maximumFailureRate)
  ) {
    reasons.push(
      'FAILURE_RATE_TOO_HIGH'
    );
  }

  const healthy =
    reasons.length === 0;

  return {
    healthy,
    runtimeEligible:
      healthy,
    revoke:
      !healthy,
    reasons
  };
}

module.exports = {
  assess
};
