'use strict';

function evaluate({
  certifiedAt,
  expiresAt,
  receiptValid,
  priceFresh,
  benchmarkFresh,
  now = Date.now()
}) {
  const reasons = [];

  const certified =
    Date.parse(certifiedAt);

  const expiry =
    Date.parse(expiresAt);

  if (
    !Number.isFinite(certified)
  ) {
    reasons.push(
      'CERTIFIED_AT_INVALID'
    );
  }

  if (
    !Number.isFinite(expiry)
  ) {
    reasons.push(
      'EXPIRY_INVALID'
    );
  }

  if (
    Number.isFinite(expiry) &&
    expiry <= now
  ) {
    reasons.push(
      'CERTIFICATION_EXPIRED'
    );
  }

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

  return {
    runtimeEligible:
      reasons.length === 0,

    recertificationRequired:
      reasons.length > 0,

    reasons
  };
}

module.exports = {
  evaluate
};
