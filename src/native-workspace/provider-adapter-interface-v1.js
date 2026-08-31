'use strict';

class ProviderAdapter {
  constructor({
    provider,
    networkCapable = false
  } = {}) {
    if (
      !provider ||
      typeof provider !== 'string'
    ) {
      throw new Error(
        'PROVIDER_ADAPTER_NAME_REQUIRED'
      );
    }

    this.provider = provider;
    this.networkCapable =
      networkCapable === true;
  }

  describe() {
    return {
      provider:this.provider,
      network_capable:
        this.networkCapable
    };
  }

  async invoke() {
    throw new Error(
      'PROVIDER_ADAPTER_INVOKE_NOT_IMPLEMENTED'
    );
  }
}

function assertAdapter(adapter) {
  if (
    !adapter ||
    typeof adapter.invoke !==
      'function' ||
    typeof adapter.describe !==
      'function'
  ) {
    throw new Error(
      'PROVIDER_ADAPTER_INVALID'
    );
  }

  const description =
    adapter.describe();

  if (
    !description ||
    !description.provider
  ) {
    throw new Error(
      'PROVIDER_ADAPTER_DESCRIPTION_INVALID'
    );
  }

  return true;
}

module.exports = {
  ProviderAdapter,
  assertAdapter
};
