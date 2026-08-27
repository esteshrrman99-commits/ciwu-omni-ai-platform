'use strict';

class ProviderAdapter {
  constructor(config = {}) {
    this.id = config.id || 'custom';
    this.name = config.name || 'Custom Provider';
  }

  async listModels() {
    return [];
  }

  async generate() {
    throw new Error(
      `Provider ${this.id} does not implement generate()`
    );
  }
}

module.exports = ProviderAdapter;
