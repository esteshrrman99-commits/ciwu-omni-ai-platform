'use strict';

function verify({
  receipt,
  expectedProvider,
  expectedModel,
  expectedCeremonyId,
  maximumObservedCostUsd=0
}) {
  const failures=[];

  if (!receipt)
    failures.push('RECEIPT_REQUIRED');

  if (
    receipt?.provider !== expectedProvider
  ) {
    failures.push('PROVIDER_MISMATCH');
  }

  if (
    receipt?.model !== expectedModel
  ) {
    failures.push('MODEL_MISMATCH');
  }

  if (
    receipt?.ceremonyId !==
    expectedCeremonyId
  ) {
    failures.push('CEREMONY_MISMATCH');
  }

  if (
    receipt?.networkObserved !== true
  ) {
    failures.push(
      'REAL_NETWORK_OBSERVATION_REQUIRED'
    );
  }

  const cost=
    Number(receipt?.observedCostUsd);

  if (!Number.isFinite(cost)) {
    failures.push(
      'OBSERVED_COST_UNKNOWN'
    );
  } else if (
    cost >
    Number(maximumObservedCostUsd)
  ) {
    failures.push(
      'OBSERVED_COST_EXCEEDED'
    );
  }

  if (
    !Number.isInteger(
      Number(receipt?.httpStatus)
    )
  ) {
    failures.push(
      'HTTP_STATUS_REQUIRED'
    );
  }

  return {
    verified:
      failures.length === 0,
    failures
  };
}

module.exports={ verify };
