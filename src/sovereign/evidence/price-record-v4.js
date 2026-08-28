'use strict';

const crypto=require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function create({
  provider,
  model,
  source,
  verifiedAt,
  expiresAt,
  inputUsdPerMillion,
  outputUsdPerMillion,
  zeroCostStatus='UNKNOWN'
}) {
  if (!provider || !model || !source)
    throw new Error('PRICE_IDENTITY_REQUIRED');

  const verified=new Date(verifiedAt).getTime();
  const expires=new Date(expiresAt).getTime();

  if (
    !Number.isFinite(verified) ||
    !Number.isFinite(expires) ||
    expires <= verified
  ) {
    throw new Error('INVALID_PRICE_TIMESTAMPS');
  }

  const input=Number(inputUsdPerMillion);
  const output=Number(outputUsdPerMillion);

  if (
    !Number.isFinite(input) ||
    !Number.isFinite(output) ||
    input < 0 ||
    output < 0
  ) {
    throw new Error('INVALID_PRICE');
  }

  const core={
    schema:'CIWU_PRICE_EVIDENCE_V4',
    provider,
    model,
    source,
    verifiedAt:new Date(verified).toISOString(),
    expiresAt:new Date(expires).toISOString(),
    inputUsdPerMillion:input,
    outputUsdPerMillion:output,
    zeroCostStatus
  };

  return {
    ...core,
    evidenceHash:hash(core)
  };
}

function fresh(record, now=Date.now()) {
  const expiry=
    new Date(record.expiresAt).getTime();

  return (
    Number.isFinite(expiry) &&
    now < expiry
  );
}

module.exports={
  create,
  fresh,
  hash
};
