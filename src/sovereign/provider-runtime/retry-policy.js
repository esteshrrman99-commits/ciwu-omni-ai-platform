'use strict';

const RETRYABLE =
  new Set([
    'RATE_LIMITED',
    'TIMEOUT',
    'TEMPORARY_PROVIDER_FAILURE'
  ]);

const NON_RETRYABLE =
  new Set([
    'AUTHENTICATION_FAILED',
    'BILLING_BLOCKED',
    'INVALID_REQUEST',
    'UNKNOWN_COST'
  ]);

function classify(
  reason
) {
  if (
    RETRYABLE.has(
      reason
    )
  ) {
    return 'RETRYABLE';
  }

  if (
    NON_RETRYABLE.has(
      reason
    )
  ) {
    return 'NON_RETRYABLE';
  }

  return 'UNKNOWN';
}

function delayMs(
  attempt,
  {
    baseMs = 250,
    capMs = 8000
  } = {}
) {
  const n =
    Math.max(
      0,
      Number(attempt)
    );

  return Math.min(
    capMs,
    baseMs *
    (2 ** n)
  );
}

function mayRetry({
  reason,
  attempt,
  maxAttempts = 3
}) {
  if (
    classify(reason) !==
    'RETRYABLE'
  ) {
    return false;
  }

  return (
    Number(attempt) <
    Number(maxAttempts)
  );
}

module.exports = {
  RETRYABLE,
  NON_RETRYABLE,
  classify,
  delayMs,
  mayRetry
};
