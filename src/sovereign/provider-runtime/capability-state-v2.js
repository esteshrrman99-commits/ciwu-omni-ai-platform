'use strict';

const STATES = Object.freeze([
  'UNCONFIGURED',
  'CONFIGURED',
  'DISCOVERED',
  'INFERENCE_CERTIFIED',
  'COST_CERTIFIED',
  'BENCHMARK_CERTIFIED',
  'RUNTIME_ELIGIBLE',
  'DEGRADED',
  'BILLING_BLOCKED',
  'REVOKED'
]);

const TRANSITIONS =
  Object.freeze({
    UNCONFIGURED: {
      CONFIGURE: 'CONFIGURED'
    },

    CONFIGURED: {
      DISCOVER: 'DISCOVERED',
      REVOKE: 'REVOKED'
    },

    DISCOVERED: {
      CERTIFY_INFERENCE:
        'INFERENCE_CERTIFIED',
      REVOKE: 'REVOKED'
    },

    INFERENCE_CERTIFIED: {
      CERTIFY_COST:
        'COST_CERTIFIED',
      DEGRADE: 'DEGRADED',
      REVOKE: 'REVOKED'
    },

    COST_CERTIFIED: {
      CERTIFY_BENCHMARK:
        'BENCHMARK_CERTIFIED',
      DEGRADE: 'DEGRADED',
      REVOKE: 'REVOKED'
    },

    BENCHMARK_CERTIFIED: {
      ADMIT_RUNTIME:
        'RUNTIME_ELIGIBLE',
      DEGRADE: 'DEGRADED',
      REVOKE: 'REVOKED'
    },

    RUNTIME_ELIGIBLE: {
      DEGRADE: 'DEGRADED',
      BILLING_BLOCK:
        'BILLING_BLOCKED',
      REVOKE: 'REVOKED'
    },

    DEGRADED: {
      RECERTIFY:
        'INFERENCE_CERTIFIED',
      REVOKE: 'REVOKED'
    },

    BILLING_BLOCKED: {
      RECERTIFY:
        'INFERENCE_CERTIFIED',
      REVOKE: 'REVOKED'
    },

    REVOKED: {}
  });

function transition(
  state,
  event
) {
  if (
    !STATES.includes(state)
  ) {
    throw new Error(
      'UNKNOWN_PROVIDER_STATE'
    );
  }

  const next =
    TRANSITIONS[state]?.[event];

  if (!next) {
    throw new Error(
      'ILLEGAL_PROVIDER_TRANSITION'
    );
  }

  return next;
}

function runtimeEligible(state) {
  return (
    state ===
    'RUNTIME_ELIGIBLE'
  );
}

module.exports = {
  STATES,
  TRANSITIONS,
  transition,
  runtimeEligible
};
