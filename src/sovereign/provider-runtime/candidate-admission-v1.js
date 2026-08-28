'use strict';

function evaluate({
  configured,
  discovered,
  priceFresh,
  costClass,
  priceEvidenceHash,
  modelAllowed,
  providerAllowed
}) {
  const reasons = [];

  if (configured !== true)
    reasons.push(
      'PROVIDER_NOT_CONFIGURED'
    );

  if (discovered !== true)
    reasons.push(
      'MODEL_NOT_DISCOVERED'
    );

  if (priceFresh !== true)
    reasons.push(
      'PRICE_EVIDENCE_NOT_FRESH'
    );

  if (
    costClass !==
    'ZERO_VERIFIED'
  ) {
    reasons.push(
      'NOT_ZERO_COST_VERIFIED'
    );
  }

  if (!priceEvidenceHash)
    reasons.push(
      'PRICE_EVIDENCE_HASH_MISSING'
    );

  if (modelAllowed !== true)
    reasons.push(
      'MODEL_NOT_ALLOWLISTED'
    );

  if (providerAllowed !== true)
    reasons.push(
      'PROVIDER_NOT_ALLOWLISTED'
    );

  return {
    admitted:
      reasons.length === 0,

    reasons
  };
}

module.exports = {
  evaluate
};
