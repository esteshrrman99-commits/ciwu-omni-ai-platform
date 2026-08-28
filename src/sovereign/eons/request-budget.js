'use strict';

function authorize({
  monthlySpentUsd,
  projectedRequestUsd,
  hardCapUsd = 100,
  paidAuthorized = false,
  costClass
}) {
  const spent =
    Number(
      monthlySpentUsd
    );

  const projected =
    Number(
      projectedRequestUsd
    );

  const cap =
    Number(
      hardCapUsd
    );

  if (
    !Number.isFinite(spent) ||
    !Number.isFinite(projected) ||
    !Number.isFinite(cap)
  ) {
    return {
      allowed: false,
      reason:
        'INVALID_COST_INPUT'
    };
  }

  if (
    projected < 0
  ) {
    return {
      allowed: false,
      reason:
        'NEGATIVE_PROJECTED_COST'
    };
  }

  if (
    costClass === 'UNKNOWN'
  ) {
    return {
      allowed: false,
      reason:
        'UNKNOWN_COST'
    };
  }

  if (
    costClass === 'PAID' &&
    paidAuthorized !== true
  ) {
    return {
      allowed: false,
      reason:
        'PAID_NOT_AUTHORIZED'
    };
  }

  if (
    spent + projected >
    cap
  ) {
    return {
      allowed: false,
      reason:
        'MONTHLY_CAP_EXCEEDED'
    };
  }

  return {
    allowed: true,
    reason:
      'BUDGET_GATE_PASS',
    remainingAfterUsd:
      cap -
      spent -
      projected
  };
}

module.exports = {
  authorize
};
