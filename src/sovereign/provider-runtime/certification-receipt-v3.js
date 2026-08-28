'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  session,
  nonce,
  requestHash,
  responseHash,
  statusCode,
  latencyMs,
  observedCostUsd,
  realNetworkCall
}) {
  if (
    session?.state !==
    'AUTHORIZED_NOT_EXECUTED' &&
    session?.state !==
    'EXECUTING'
  ) {
    throw new Error(
      'SESSION_STATE_NOT_EXECUTABLE'
    );
  }

  if (
    realNetworkCall !== true
  ) {
    throw new Error(
      'REAL_NETWORK_CALL_REQUIRED'
    );
  }

  const nonceHash =
    crypto
      .createHash('sha256')
      .update(String(nonce))
      .digest('hex');

  if (
    nonceHash !==
    session.nonceHash
  ) {
    throw new Error(
      'SESSION_NONCE_MISMATCH'
    );
  }

  const status =
    Number(statusCode);

  if (
    !Number.isInteger(status)
  ) {
    throw new Error(
      'STATUS_CODE_INVALID'
    );
  }

  const latency =
    Number(latencyMs);

  if (
    !Number.isFinite(latency) ||
    latency < 0
  ) {
    throw new Error(
      'LATENCY_INVALID'
    );
  }

  const cost =
    Number(observedCostUsd);

  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    throw new Error(
      'OBSERVED_COST_INVALID'
    );
  }

  if (
    session.costClass ===
      'ZERO_VERIFIED' &&
    cost !== 0
  ) {
    throw new Error(
      'ZERO_COST_SESSION_CONTRADICTED'
    );
  }

  const base = {
    schema:
      'CIWU_CERTIFICATION_RECEIPT_V3',

    sessionId:
      session.sessionId,

    provider:
      session.provider,

    model:
      session.model,

    nonceHash:
      session.nonceHash,

    priceEvidenceHash:
      session.priceEvidenceHash,

    requestHash,
    responseHash,

    statusCode:
      status,

    latencyMs:
      latency,

    observedCostUsd:
      cost,

    realNetworkCall:
      true,

    createdAt:
      new Date()
        .toISOString()
  };

  return {
    ...base,
    receiptHash:
      hash(base)
  };
}

function verify(
  receipt
) {
  if (!receipt?.receiptHash)
    return false;

  const copy = {
    ...receipt
  };

  delete copy.receiptHash;

  return (
    hash(copy) ===
    receipt.receiptHash
  );
}

module.exports = {
  hash,
  create,
  verify
};
