'use strict';

const TRANSIENT =
  new Set([
    'TIMEOUT',
    'NETWORK_FAILURE',
    'RATE_LIMITED',
    'TEMPORARY_PROVIDER_FAILURE'
  ]);

const HARD =
  new Set([
    'BILLING_OR_QUOTA_BLOCKED',
    'AUTHORIZATION_FAILURE',
    'INVALID_REQUEST_OR_POLICY'
  ]);

function create({
  decayAfterSuccesses = 2,
  circuitThreshold = 3
} = {}) {
  let failures = 0;
  let successes = 0;
  let circuitOpen = false;
  let lastFailureClass = null;

  function recordFailure(
    failureClass
  ) {
    failures += 1;
    successes = 0;
    lastFailureClass =
      failureClass;

    if (
      HARD.has(failureClass) ||
      failures >=
        Number(circuitThreshold)
    ) {
      circuitOpen = true;
    }

    return snapshot();
  }

  function recordSuccess() {
    successes += 1;

    if (
      successes >=
      Number(decayAfterSuccesses)
    ) {
      failures =
        Math.max(
          0,
          failures - 1
        );

      successes = 0;
    }

    return snapshot();
  }

  function halfOpen() {
    if (!circuitOpen) {
      return false;
    }

    circuitOpen = false;
    failures =
      Math.max(
        0,
        failures - 1
      );

    return true;
  }

  function snapshot() {
    return {
      failures,
      successes,
      circuitOpen,
      lastFailureClass,

      transient:
        lastFailureClass
          ? TRANSIENT.has(
              lastFailureClass
            )
          : false,

      hard:
        lastFailureClass
          ? HARD.has(
              lastFailureClass
            )
          : false
    };
  }

  return {
    recordFailure,
    recordSuccess,
    halfOpen,
    snapshot
  };
}

module.exports = {
  TRANSIENT,
  HARD,
  create
};
