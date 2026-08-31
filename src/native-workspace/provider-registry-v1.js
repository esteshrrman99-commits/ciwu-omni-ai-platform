'use strict';

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  register(name, adapter, metadata = {}) {
    if (
      typeof name !== 'string' ||
      !name ||
      !adapter ||
      typeof adapter.complete !== 'function'
    ) {
      throw new Error('INVALID_PROVIDER');
    }

    this.providers.set(name, {
      adapter,
      metadata: {
        enabled: metadata.enabled === true,
        healthy: metadata.healthy === true,
        server_side: metadata.server_side !== false
      }
    });

    return this;
  }

  get(name) {
    return this.providers.get(name) || null;
  }

  available() {
    return [...this.providers.entries()]
      .filter(([, value]) =>
        value.metadata.enabled === true &&
        value.metadata.healthy === true &&
        value.metadata.server_side === true
      )
      .map(([name]) => name)
      .sort();
  }
}

module.exports = {
  ProviderRegistry
};
