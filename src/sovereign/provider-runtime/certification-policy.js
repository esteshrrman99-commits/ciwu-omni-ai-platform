'use strict';

const COST_CLASSES =
  Object.freeze([
    'ZERO_VERIFIED',
    'PAID',
    'UNKNOWN'
  ]);

function evaluate({
  configured,
  realInferenceAuthorized,
  paidInferenceAuthorized,
  costClass,
  priceEvidenceFresh,
  providerCertified
}) {
  if (!configured) {
    return {
      allowed: false,
      reason: 'PROVIDER_NOT_CONFIGURED'
    };
  }

  if (
    realInferenceAuthorized !== true
  ) {
    return {
      allowed: false,
      reason: 'REAL_INFERENCE_NOT_AUTHORIZED'
    };
  }

  if (
    !COST_CLASSES.includes(
      costClass
    )
  ) {
    return {
      allowed: false,
      reason: 'INVALID_COST_CLASS'
    };
  }

  if (
    costClass === 'UNKNOWN'
  ) {
    return {
      allowed: false,
      reason: 'UNKNOWN_COST'
    };
  }

  if (
    priceEvidenceFresh !== true
  ) {
    return {
      allowed: false,
      reason: 'STALE_OR_MISSING_PRICE_EVIDENCE'
    };
  }

  if (
    costClass === 'PAID' &&
    paidInferenceAuthorized !== true
  ) {
    return {
      allowed: false,
      reason: 'PAID_INFERENCE_NOT_AUTHORIZED'
    };
  }

  return {
    allowed: true,
    reason:
      providerCertified === true
        ? 'CERTIFIED_PROVIDER_ALLOWED'
        : 'CERTIFICATION_PROBE_ALLOWED'
  };
}

module.exports = {
  COST_CLASSES,
  evaluate
};
