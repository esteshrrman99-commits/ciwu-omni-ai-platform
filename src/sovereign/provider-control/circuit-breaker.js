'use strict';

class CircuitBreaker {
  constructor({
    threshold = 3,
    cooldownMs = 60000
  } = {}) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.state = new Map();
  }

  recordFailure(id, now = Date.now()) {
    const current = this.state.get(id) || {
      failures: 0,
      openedAt: null
    };

    current.failures++;

    if (current.failures >= this.threshold)
      current.openedAt = now;

    this.state.set(id, current);
    return this.status(id, now);
  }

  recordSuccess(id) {
    this.state.set(id, {
      failures: 0,
      openedAt: null
    });

    return 'CLOSED';
  }

  status(id, now = Date.now()) {
    const current = this.state.get(id);

    if (!current)
      return 'CLOSED';

    if (current.openedAt === null)
      return 'CLOSED';

    if (
      now - current.openedAt >=
      this.cooldownMs
    ) return 'HALF_OPEN';

    return 'OPEN';
  }
}

module.exports = {
  CircuitBreaker
};
