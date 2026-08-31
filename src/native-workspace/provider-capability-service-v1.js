'use strict';

const {
  ProviderCapabilityRegistry
} = require(
  './provider-capability-registry-v1'
);

const {
  ProviderNetworkGate
} = require(
  './provider-network-gate-v1'
);

const {
  ProviderPolicyRouter
} = require(
  './provider-policy-router-v1'
);

class ProviderCapabilityService {
  constructor({
    entries,
    configuredProviders = [],
    env = process.env,
    globalNetworkEnabled =
      false,
    providerAllowlist = []
  } = {}) {
    this.registry =
      new ProviderCapabilityRegistry({
        entries
      });

    this.networkGate =
      new ProviderNetworkGate({
        globalNetworkEnabled,
        providerAllowlist
      });

    this.router =
      new ProviderPolicyRouter({
        registry:
          this.registry,
        networkGate:
          this.networkGate,
        configuredProviders,
        env
      });
  }

  list() {
    return {
      ok:true,
      registry:
        this.registry.list(),
      model_network_call:false,
      operational_authority:false
    };
  }

  evaluate(body = {}) {
    const route =
      this.router.route(body);

    return {
      ok:true,
      route,
      model_network_call:false,
      real_provider_credential_used:
        false,
      operational_authority:false
    };
  }
}

module.exports = {
  ProviderCapabilityService
};
