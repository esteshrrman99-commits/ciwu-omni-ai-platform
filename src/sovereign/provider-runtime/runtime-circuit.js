'use strict';

function create({
  threshold = 3,
  cooldownMs = 30000
} = {}) {
  return {
    state:
      'CLOSED',
    failures: 0,
    threshold,
    cooldownMs,
    openedAt: null
  };
}

function failure(
  circuit,
  now = Date.now()
) {
  circuit.failures++;

  if (
    circuit.failures >=
    circuit.threshold
  ) {
    circuit.state =
      'OPEN';

    circuit.openedAt =
      now;
  }

  return circuit;
}

function success(
  circuit
) {
  circuit.state =
    'CLOSED';

  circuit.failures =
    0;

  circuit.openedAt =
    null;

  return circuit;
}

function mayAttempt(
  circuit,
  now = Date.now()
) {
  if (
    circuit.state ===
    'CLOSED'
  ) {
    return true;
  }

  if (
    circuit.openedAt === null
  ) {
    return false;
  }

  if (
    now -
    circuit.openedAt >=
    circuit.cooldownMs
  ) {
    circuit.state =
      'HALF_OPEN';

    return true;
  }

  return false;
}

module.exports = {
  create,
  failure,
  success,
  mayAttempt
};
