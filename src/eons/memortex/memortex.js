'use strict';

class MEMORTEX {
  constructor() {
    this.history = [];
  }

  record(event) {
    this.history.push({
      timestamp: new Date().toISOString(),
      ...event
    });

    return true;
  }

  getHistory() {
    return this.history;
  }
}

module.exports = MEMORTEX;
