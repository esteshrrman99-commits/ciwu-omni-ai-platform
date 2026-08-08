'use strict';

const STATES = [
  'DISCOVERED',
  'UNVERIFIED',
  'SECURITY_SCAN',
  'BENCHMARK',
  'SANDBOX',
  'QUALIFIED',
  'STAGING',
  'PRODUCTION',
  'MONITORED',
  'DEPRECATED',
  'RETIRED'
];

class Lifecycle {
  transition(model, state) {
    if (!STATES.includes(state)) {
      throw new Error(`Invalid lifecycle state: ${state}`);
    }

    return {
      ...model,
      lifecycle_state: state,
      lifecycle_timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  Lifecycle,
  STATES
};
