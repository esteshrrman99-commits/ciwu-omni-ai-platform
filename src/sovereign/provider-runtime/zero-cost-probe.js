'use strict';

function authorize({
  explicitAuthorization,
  costClass,
  priceEvidenceFresh,
  providerConfigured,
  requestedMaximumCostUsd = 0
}) {
  if (
    explicitAuthorization !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'EXPLICIT_AUTHORIZATION_REQUIRED'
    };
  }

  if (
    providerConfigured !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'PROVIDER_NOT_CONFIGURED'
    };
  }

  if (
    costClass !==
    'ZERO_VERIFIED'
  ) {
    return {
      allowed: false,
      reason:
        'ZERO_COST_ONLY'
    };
  }

  if (
    priceEvidenceFresh !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'PRICE_EVIDENCE_NOT_FRESH'
    };
  }

  if (
    Number(
      requestedMaximumCostUsd
    ) !== 0
  ) {
    return {
      allowed: false,
      reason:
        'NONZERO_COST_NOT_ALLOWED'
    };
  }

  return {
    allowed: true,
    reason:
      'ZERO_COST_PROBE_AUTHORIZED'
  };
}

module.exports = {
  authorize
};
