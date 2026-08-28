'use strict';

const {
  verifyNonce
} = require(
  './certification-session-v3'
);

async function execute({
  session,
  nonce,
  explicitAuthorization,
  adapter,
  request
}) {
  if (
    explicitAuthorization !== true
  ) {
    return {
      executed: false,
      reason:
        'EXPLICIT_AUTHORIZATION_REQUIRED'
    };
  }

  if (
    session?.costClass !==
    'ZERO_VERIFIED'
  ) {
    return {
      executed: false,
      reason:
        'ZERO_COST_ONLY'
    };
  }

  if (
    Number(
      session.maximumCostUsd
    ) !== 0
  ) {
    return {
      executed: false,
      reason:
        'NONZERO_MAXIMUM_COST_BLOCKED'
    };
  }

  if (
    !verifyNonce(
      session,
      nonce
    )
  ) {
    return {
      executed: false,
      reason:
        'SESSION_NONCE_INVALID'
    };
  }

  if (
    typeof adapter !==
    'function'
  ) {
    return {
      executed: false,
      reason:
        'ADAPTER_REQUIRED'
    };
  }

  const started =
    Date.now();

  const result =
    await adapter({
      provider:
        session.provider,

      model:
        session.model,

      request
    });

  return {
    executed: true,

    sessionId:
      session.sessionId,

    provider:
      session.provider,

    model:
      session.model,

    result,

    elapsedMs:
      Math.max(
        0,
        Date.now() -
        started
      )
  };
}

module.exports = {
  execute
};
