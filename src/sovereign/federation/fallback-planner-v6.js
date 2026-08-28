'use strict';

const FALLBACK_FAILURES =
  new Set([
    'TIMEOUT',
    'NETWORK_FAILURE',
    'RATE_LIMITED',
    'BILLING_OR_QUOTA_BLOCKED',
    'TEMPORARY_PROVIDER_FAILURE'
  ]);

const TERMINAL_FAILURES =
  new Set([
    'AUTHORIZATION_FAILURE',
    'INVALID_REQUEST_OR_POLICY'
  ]);

function plan({
  ranked,
  attempted = [],
  failureClass = null
}) {
  const used =
    new Set(attempted);

  if (
    failureClass &&
    TERMINAL_FAILURES.has(
      failureClass
    )
  ) {
    return {
      continue: false,
      reason:
        'TERMINAL_FAILURE'
    };
  }

  if (
    failureClass &&
    !FALLBACK_FAILURES.has(
      failureClass
    )
  ) {
    return {
      continue: false,
      reason:
        'UNKNOWN_FAILURE_ABSTAIN'
    };
  }

  const next =
    (ranked || []).find(
      item => {
        const entry =
          item.entry || item;

        const id =
          `${entry.provider}::${entry.model}`;

        return (
          entry.runtimeEligible === true &&
          !used.has(id)
        );
      }
    );

  if (!next) {
    return {
      continue: false,
      reason:
        'CERTIFIED_CHAIN_EXHAUSTED'
    };
  }

  return {
    continue: true,
    reason:
      failureClass
        ? 'CERTIFIED_FALLBACK'
        : 'PRIMARY_SELECTION',

    entry:
      next.entry || next
  };
}

module.exports = {
  FALLBACK_FAILURES,
  TERMINAL_FAILURES,
  plan
};
