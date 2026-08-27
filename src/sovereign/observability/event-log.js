'use strict';

const crypto =
  require('node:crypto');

function event({
  type,
  component,
  outcome,
  evidence = null,
  metadata = {}
}) {
  if (
    !type ||
    !component ||
    !outcome
  ) {
    throw new Error(
      'EVENT_FIELDS_REQUIRED'
    );
  }

  return {
    id:
      crypto.randomUUID(),

    type,
    component,
    outcome,
    evidence,
    metadata,

    timestamp:
      new Date()
        .toISOString()
  };
}

module.exports = {
  event
};
