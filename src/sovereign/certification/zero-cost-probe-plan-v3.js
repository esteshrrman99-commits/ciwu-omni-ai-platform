'use strict';

function build({
  provider,
  model,
  priceEvidence,
  authorization,
  maxObservedCostUsd = 0
}) {
  if (!provider || !model) {
    return {
      executable:false,
      reason:
        'PROVIDER_MODEL_REQUIRED'
    };
  }

  if (
    authorization !==
    'EXPLICITLY_AUTHORIZED'
  ) {
    return {
      executable:false,
      reason:
        'EXPLICIT_AUTHORIZATION_REQUIRED'
    };
  }

  if (
    !priceEvidence ||
    priceEvidence.status !==
      'ZERO_VERIFIED'
  ) {
    return {
      executable:false,
      reason:
        'ZERO_COST_NOT_VERIFIED'
    };
  }

  if (
    Number(maxObservedCostUsd) !== 0
  ) {
    return {
      executable:false,
      reason:
        'NONZERO_COST_NOT_ALLOWED'
    };
  }

  return {
    executable:true,

    provider,
    model,

    maxObservedCostUsd:0,

    networkCallAuthorized:true,

    paidFallbackAuthorized:false,

    purchaseAuthorized:false,

    reason:
      'ZERO_COST_PROBE_READY'
  };
}

module.exports = {
  build
};
