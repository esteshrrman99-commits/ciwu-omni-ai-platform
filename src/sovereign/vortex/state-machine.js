'use strict';

const TRANSITIONS = Object.freeze({
  RECEIVED:   ['CLASSIFIED','ABSTAINED'],
  CLASSIFIED: ['ROUTED','ABSTAINED'],
  ROUTED:     ['RUNNING','ABSTAINED'],
  RUNNING:    ['VALIDATING','FAILED'],
  VALIDATING: ['COMPLETED','ESCALATED','FAILED'],
  ESCALATED:  ['ROUTED','ABSTAINED'],
  FAILED:     ['ESCALATED','ABSTAINED'],
  COMPLETED:  [],
  ABSTAINED:  []
});

function transition(current, next) {
  const allowed = TRANSITIONS[current];

  if (!allowed)
    throw new Error('UNKNOWN_STATE');

  if (!allowed.includes(next))
    throw new Error(`ILLEGAL_TRANSITION:${current}->${next}`);

  return next;
}

module.exports = {
  TRANSITIONS,
  transition
};
