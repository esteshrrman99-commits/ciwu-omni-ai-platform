'use strict';

function transition(
  state,
  event
) {
  const transitions = {
    AUTHORIZED_NOT_EXECUTED: {
      START:
        'EXECUTING',
      CANCEL:
        'CANCELLED'
    },

    EXECUTING: {
      SUCCESS:
        'COMPLETED_SUCCESS',
      FAILURE:
        'COMPLETED_FAILURE',
      BILLING_BLOCK:
        'BILLING_BLOCKED',
      TIMEOUT:
        'TIMED_OUT'
    }
  };

  const next =
    transitions[state]?.[event];

  if (!next) {
    throw new Error(
      'ILLEGAL_PROBE_STATE_TRANSITION'
    );
  }

  return next;
}

module.exports = {
  transition
};
