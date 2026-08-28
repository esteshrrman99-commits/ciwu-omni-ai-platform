'use strict';

function reconcile({
  declaredCostClass,
  observedCostUsd,
  maximumAuthorizedCostUsd,
  inputTokens,
  outputTokens
}) {
  const cost =
    observedCostUsd === null
      ? null
      : Number(
          observedCostUsd
        );

  const max =
    Number(
      maximumAuthorizedCostUsd
    );

  const input =
    Number(
      inputTokens ?? 0
    );

  const output =
    Number(
      outputTokens ?? 0
    );

  if (
    cost === null
  ) {
    return {
      reconciled: false,
      reason:
        'OBSERVED_COST_UNKNOWN'
    };
  }

  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    return {
      reconciled: false,
      reason:
        'OBSERVED_COST_INVALID'
    };
  }

  if (
    !Number.isFinite(max) ||
    max < 0
  ) {
    return {
      reconciled: false,
      reason:
        'AUTHORIZED_COST_INVALID'
    };
  }

  if (
    !Number.isFinite(input) ||
    !Number.isFinite(output) ||
    input < 0 ||
    output < 0
  ) {
    return {
      reconciled: false,
      reason:
        'TOKEN_USAGE_INVALID'
    };
  }

  if (cost > max) {
    return {
      reconciled: false,
      reason:
        'AUTHORIZED_COST_EXCEEDED'
    };
  }

  if (
    declaredCostClass ===
      'ZERO_VERIFIED' &&
    cost !== 0
  ) {
    return {
      reconciled: false,
      reason:
        'ZERO_COST_CLAIM_CONTRADICTED'
    };
  }

  return {
    reconciled: true,

    reason:
      'COST_RECONCILIATION_PASS',

    observedCostUsd:
      cost,

    inputTokens:
      input,

    outputTokens:
      output,

    totalTokens:
      input + output
  };
}

module.exports = {
  reconcile
};
