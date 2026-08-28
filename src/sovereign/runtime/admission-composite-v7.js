'use strict';

function assess({
  providerState,
  evidenceFresh,
  priceFresh,
  benchmarkFresh,
  receiptValid,
  budgetAllowed,
  circuitOpen,
  revocationPresent,
  authorizationValid
}) {
  const failures = [];

  if (
    providerState !==
    'RUNTIME_ELIGIBLE'
  ) {
    failures.push(
      'PROVIDER_NOT_RUNTIME_ELIGIBLE'
    );
  }

  if (evidenceFresh !== true)
    failures.push(
      'EVIDENCE_STALE'
    );

  if (priceFresh !== true)
    failures.push(
      'PRICE_STALE'
    );

  if (benchmarkFresh !== true)
    failures.push(
      'BENCHMARK_STALE'
    );

  if (receiptValid !== true)
    failures.push(
      'RECEIPT_INVALID'
    );

  if (budgetAllowed !== true)
    failures.push(
      'BUDGET_NOT_AUTHORIZED'
    );

  if (circuitOpen === true)
    failures.push(
      'CIRCUIT_OPEN'
    );

  if (revocationPresent === true)
    failures.push(
      'PROVIDER_REVOKED'
    );

  if (
    authorizationValid !==
    true
  )
    failures.push(
      'AUTHORIZATION_INVALID'
    );

  return {
    admitted:
      failures.length === 0,

    abstain:
      failures.length !== 0,

    failures
  };
}

module.exports = {
  assess
};
