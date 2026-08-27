'use strict';

const DEFAULT_MONTHLY_CAP_USD = 100;

function authorizeSpend({
  monthlySpentUsd,
  projectedRequestUsd,
  monthlyCapUsd = DEFAULT_MONTHLY_CAP_USD,
  paidProviderAuthorized = false
}) {
  const values = [
    monthlySpentUsd,
    projectedRequestUsd,
    monthlyCapUsd
  ];

  if (!values.every(Number.isFinite))
    return {
      authorized: false,
      reason: 'UNKNOWN_COST'
    };

  if (monthlySpentUsd < 0 ||
      projectedRequestUsd < 0 ||
      monthlyCapUsd < 0)
    return {
      authorized: false,
      reason: 'INVALID_COST'
    };

  if (projectedRequestUsd === 0)
    return {
      authorized: true,
      reason: 'ZERO_COST'
    };

  if (paidProviderAuthorized !== true)
    return {
      authorized: false,
      reason: 'PAID_PROVIDER_NOT_AUTHORIZED'
    };

  if (
    monthlySpentUsd + projectedRequestUsd >
    monthlyCapUsd
  )
    return {
      authorized: false,
      reason: 'MONTHLY_CAP_EXCEEDED'
    };

  return {
    authorized: true,
    reason: 'WITHIN_AUTHORIZED_CAP'
  };
}

module.exports = {
  DEFAULT_MONTHLY_CAP_USD,
  authorizeSpend
};
