'use strict';

const crypto=require('node:crypto');

function authorize({
  provider,
  model,
  ceremonyId,
  priceEvidenceFresh,
  zeroCostStatus,
  explicitUserAuthorization,
  maximumCostUsd
}) {
  const failures=[];

  if (!provider || !model)
    failures.push('PROVIDER_MODEL_REQUIRED');

  if (!ceremonyId)
    failures.push('CEREMONY_REQUIRED');

  if (priceEvidenceFresh !== true)
    failures.push('PRICE_EVIDENCE_STALE');

  if (zeroCostStatus !== 'ZERO_VERIFIED')
    failures.push('ZERO_COST_NOT_VERIFIED');

  if (explicitUserAuthorization !== true)
    failures.push('EXPLICIT_AUTHORIZATION_REQUIRED');

  if (Number(maximumCostUsd) !== 0)
    failures.push('MAXIMUM_COST_MUST_BE_ZERO');

  if (failures.length)
    return {
      authorized:false,
      failures
    };

  return {
    authorized:true,
    authorizationId:
      crypto.randomUUID(),
    provider,
    model,
    ceremonyId,
    maximumCostUsd:0,
    paidFallback:false,
    purchaseAuthority:false,
    singleUse:true
  };
}

module.exports={ authorize };
