'use strict';

const crypto =
  require('node:crypto');

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value === 'string'
        ? value
        : JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  ceremonyId,
  nonce,
  provider,
  model,
  httpStatus,
  responseBody,
  observedCostUsd,
  networkObserved
}) {
  if (!ceremonyId || !nonce)
    throw new Error(
      'CEREMONY_BINDING_REQUIRED'
    );

  if (
    networkObserved !== true
  ) {
    throw new Error(
      'REAL_NETWORK_OBSERVATION_REQUIRED'
    );
  }

  const cost =
    Number(observedCostUsd);

  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    throw new Error(
      'OBSERVED_COST_UNKNOWN'
    );
  }

  const core = {
    schema:
      'CIWU_REAL_RESPONSE_RECEIPT_V4',

    ceremonyId,
    nonce,
    provider,
    model,

    httpStatus:
      Number(httpStatus),

    responseHash:
      sha(responseBody),

    observedCostUsd:
      cost,

    networkObserved:true,

    createdAt:
      new Date().toISOString()
  };

  return {
    ...core,
    receiptHash:
      sha(core)
  };
}

function verify(receipt) {
  if (!receipt?.receiptHash)
    return false;

  const core = {
    ...receipt
  };

  delete core.receiptHash;

  return (
    sha(core) ===
    receipt.receiptHash
  );
}

module.exports = {
  sha,
  create,
  verify
};
