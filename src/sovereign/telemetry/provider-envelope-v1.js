'use strict';

const crypto = require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function create({
  provider,
  model,
  requestId,
  status,
  latencyMs,
  inputTokens,
  outputTokens,
  observedCostUsd,
  failureClass = null,
  receiptHash = null,
  realNetworkCall = false
}) {
  if (!provider) {
    throw new Error('PROVIDER_REQUIRED');
  }

  if (!model) {
    throw new Error('MODEL_REQUIRED');
  }

  if (!requestId) {
    throw new Error('REQUEST_ID_REQUIRED');
  }

  const latency = Number(latencyMs);

  if (
    !Number.isFinite(latency) ||
    latency < 0
  ) {
    throw new Error('LATENCY_INVALID');
  }

  const input =
    Number(inputTokens);

  const output =
    Number(outputTokens);

  if (
    !Number.isInteger(input) ||
    input < 0 ||
    !Number.isInteger(output) ||
    output < 0
  ) {
    throw new Error('TOKEN_USAGE_INVALID');
  }

  let cost = null;

  if (
    observedCostUsd !== null &&
    observedCostUsd !== undefined
  ) {
    cost = Number(observedCostUsd);

    if (
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      throw new Error(
        'OBSERVED_COST_INVALID'
      );
    }
  }

  const base = {
    schema:
      'CIWU_PROVIDER_TELEMETRY_V1',

    provider,
    model,
    requestId,
    status,
    latencyMs: latency,
    inputTokens: input,
    outputTokens: output,
    observedCostUsd: cost,
    failureClass,
    receiptHash,
    realNetworkCall:
      realNetworkCall === true,

    recordedAt:
      new Date().toISOString()
  };

  return {
    ...base,
    telemetryHash:
      hash(base)
  };
}

function verify(record) {
  if (!record?.telemetryHash) {
    return false;
  }

  const copy = {
    ...record
  };

  delete copy.telemetryHash;

  return (
    hash(copy) ===
    record.telemetryHash
  );
}

module.exports = {
  hash,
  create,
  verify
};
