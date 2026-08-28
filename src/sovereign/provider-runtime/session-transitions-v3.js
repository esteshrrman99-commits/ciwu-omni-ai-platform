'use strict';

const LEGAL = Object.freeze({
  AUTHORIZED_NOT_EXECUTED: {
    START: 'EXECUTING',
    CANCEL: 'CANCELLED'
  },

  EXECUTING: {
    SUCCESS: 'COMPLETED_SUCCESS',
    FAILURE: 'COMPLETED_FAILURE',
    BILLING_BLOCK: 'BILLING_BLOCKED',
    RATE_LIMIT: 'RATE_LIMITED',
    TIMEOUT: 'TIMED_OUT'
  }
});

function transition(
  current,
  event
) {
  const next =
    LEGAL[current]?.[event];

  if (!next) {
    throw new Error(
      'ILLEGAL_CERTIFICATION_TRANSITION'
    );
  }

  return next;
}

module.exports = {
  LEGAL,
  transition
};
