'use strict';

const crypto =
  require('node:crypto');

function hash(
  value
) {
  return crypto
    .createHash('sha256')
    .update(
      String(value ?? '')
    )
    .digest('hex');
}

function create({
  provider,
  model,
  request,
  response,
  latencyMs,
  inputTokens,
  outputTokens,
  costUsd,
  costClass,
  realInference
}) {
  if (
    realInference !== true
  ) {
    throw new Error(
      'REAL_INFERENCE_TRUTH_REQUIRED'
    );
  }

  if (!provider)
    throw new Error(
      'PROVIDER_REQUIRED'
    );

  if (!model)
    throw new Error(
      'MODEL_REQUIRED'
    );

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

  const input =
    Number(inputTokens ?? 0);

  const output =
    Number(outputTokens ?? 0);

  if (
    !Number.isFinite(input) ||
    !Number.isFinite(output) ||
    input < 0 ||
    output < 0
  ) {
    throw new Error(
      'TOKEN_USAGE_INVALID'
    );
  }

  const cost =
    costUsd === null
      ? null
      : Number(costUsd);

  if (
    cost !== null &&
    (
      !Number.isFinite(cost) ||
      cost < 0
    )
  ) {
    throw new Error(
      'COST_INVALID'
    );
  }

  return {
    schema:
      'CIWU_REAL_INFERENCE_EVIDENCE_V1',

    provider,
    model,

    requestHash:
      hash(request),

    responseHash:
      hash(response),

    latencyMs:
      latency,

    inputTokens:
      input,

    outputTokens:
      output,

    totalTokens:
      input + output,

    costUsd:
      cost,

    costClass:
      costClass ||
      'UNKNOWN',

    realInference:
      true,

    createdAt:
      new Date()
        .toISOString()
  };
}

module.exports = {
  hash,
  create
};
