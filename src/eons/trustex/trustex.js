'use strict';

class TRUSTEX {
  classify(statement = {}) {
    if (statement.verified === true) return 'VERIFIED';
    if (statement.source) return 'SUPPORTED';

    return 'UNVERIFIED';
  }

  provenance(source, metadata = {}) {
    return {
      source,
      timestamp: new Date().toISOString(),
      ...metadata
    };
  }
}

module.exports = TRUSTEX;
