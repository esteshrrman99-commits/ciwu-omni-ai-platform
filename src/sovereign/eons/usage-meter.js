'use strict';

function numberOrNull(
  value
) {
  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
    : null;
}

function normalize({
  provider,
  model,
  inputTokens,
  outputTokens,
  cachedInputTokens = 0,
  costUsd = null,
  costEvidence = 'UNKNOWN'
}) {
  const input =
    numberOrNull(
      inputTokens
    );

  const output =
    numberOrNull(
      outputTokens
    );

  const cached =
    numberOrNull(
      cachedInputTokens
    );

  if (
    input === null ||
    output === null ||
    cached === null
  ) {
    throw new Error(
      'TOKEN_USAGE_INVALID'
    );
  }

  if (
    input < 0 ||
    output < 0 ||
    cached < 0
  ) {
    throw new Error(
      'NEGATIVE_TOKEN_USAGE'
    );
  }

  const cost =
    costUsd === null
      ? null
      : numberOrNull(
          costUsd
        );

  if (
    cost !== null &&
    cost < 0
  ) {
    throw new Error(
      'NEGATIVE_COST'
    );
  }

  return {
    provider:
      provider || null,

    model:
      model || null,

    inputTokens:
      input,

    outputTokens:
      output,

    cachedInputTokens:
      cached,

    totalTokens:
      input +
      output,

    costUsd:
      cost,

    costEvidence
  };
}

function requireKnownCost(
  usage
) {
  if (
    usage.costUsd === null
  ) {
    return {
      allowed: false,
      reason:
        'UNKNOWN_COST'
    };
  }

  return {
    allowed: true,
    reason:
      'KNOWN_COST'
  };
}

module.exports = {
  normalize,
  requireKnownCost
};
