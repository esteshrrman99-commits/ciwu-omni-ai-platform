'use strict';

const FALLBACK_FAILURES =
  new Set([
    'RATE_LIMITED',
    'TIMEOUT',
    'NETWORK_FAILURE',
    'TEMPORARY_PROVIDER_FAILURE',
    'BILLING_OR_QUOTA_BLOCKED'
  ]);

const TERMINAL_FAILURES =
  new Set([
    'AUTHORIZATION_FAILURE',
    'INVALID_REQUEST_OR_POLICY',
    'UNKNOWN_FAILURE'
  ]);

function classifyAction(
  failure
) {
  if (
    FALLBACK_FAILURES.has(
      failure
    )
  ) {
    return 'TRY_NEXT_PROVIDER';
  }

  if (
    TERMINAL_FAILURES.has(
      failure
    )
  ) {
    return 'ABSTAIN';
  }

  if (
    failure === 'SUCCESS'
  ) {
    return 'COMPLETE';
  }

  return 'ABSTAIN';
}

function chooseNext({
  chain,
  attempted
}) {
  const used =
    new Set(
      attempted || []
    );

  return (
    (chain || [])
      .find(
        item =>
          !used.has(
            item.id
          )
      ) ||
    null
  );
}

function handle({
  failure,
  chain,
  attempted
}) {
  const action =
    classifyAction(
      failure
    );

  if (
    action !==
    'TRY_NEXT_PROVIDER'
  ) {
    return {
      action,
      nextProvider:
        null
    };
  }

  const next =
    chooseNext({
      chain,
      attempted
    });

  if (!next) {
    return {
      action:
        'ABSTAIN',

      nextProvider:
        null,

      reason:
        'FALLBACK_CHAIN_EXHAUSTED'
    };
  }

  return {
    action:
      'TRY_NEXT_PROVIDER',

    nextProvider:
      next.id
  };
}

module.exports = {
  FALLBACK_FAILURES,
  TERMINAL_FAILURES,
  classifyAction,
  chooseNext,
  handle
};
