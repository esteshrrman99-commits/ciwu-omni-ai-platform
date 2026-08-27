'use strict';

const STATES = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  UNCONFIGURED: 'UNCONFIGURED',
  CONFIGURED_UNVERIFIED: 'CONFIGURED_UNVERIFIED',
  AVAILABLE: 'AVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  BILLING_BLOCKED: 'BILLING_BLOCKED',
  AUTH_BLOCKED: 'AUTH_BLOCKED',
  TRANSIENT_FAILURE: 'TRANSIENT_FAILURE',
  UNSUPPORTED: 'UNSUPPORTED'
});

function classify({
  configured,
  verified,
  status,
  message = ''
}) {
  if (!configured)
    return STATES.UNCONFIGURED;

  const text = String(message).toLowerCase();
  const code = Number(status || 0);

  if (
    text.includes('credit') ||
    text.includes('billing')
  ) return STATES.BILLING_BLOCKED;

  if (
    text.includes('rate limit') ||
    text.includes('quota') ||
    code === 429
  ) return STATES.RATE_LIMITED;

  if (code === 401 || code === 403)
    return STATES.AUTH_BLOCKED;

  if (code >= 500)
    return STATES.TRANSIENT_FAILURE;

  if (verified === true)
    return STATES.AVAILABLE;

  return STATES.CONFIGURED_UNVERIFIED;
}

function fallbackEligible(state) {
  return [
    STATES.UNCONFIGURED,
    STATES.CONFIGURED_UNVERIFIED,
    STATES.RATE_LIMITED,
    STATES.BILLING_BLOCKED,
    STATES.AUTH_BLOCKED,
    STATES.TRANSIENT_FAILURE
  ].includes(state);
}

module.exports = {
  STATES,
  classify,
  fallbackEligible
};
