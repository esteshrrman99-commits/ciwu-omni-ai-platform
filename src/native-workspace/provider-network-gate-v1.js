'use strict';

class ProviderNetworkGate {
  constructor({
    globalNetworkEnabled = false,
    providerAllowlist = []
  } = {}) {
    this.globalNetworkEnabled =
      globalNetworkEnabled === true;

    this.providerAllowlist =
      new Set(
        Array.isArray(
          providerAllowlist
        )
          ? providerAllowlist
          : []
      );
  }

  evaluate({
    provider,
    capability,
    configured = false,
    credentialReport,
    networkRequested = false
  }) {
    if (
      !provider ||
      !capability
    ) {
      throw new Error(
        'NETWORK_GATE_INPUT_INVALID'
      );
    }

    const supportsNetwork =
      capability.supports_network ===
      true;

    const credentialReady =
      credentialReport &&
      credentialReport.all_present ===
        true;

    const allowlisted =
      this.providerAllowlist.has(
        provider
      );

    const networkAuthorized =
      networkRequested === true &&
      this.globalNetworkEnabled &&
      configured === true &&
      supportsNetwork &&
      credentialReady &&
      allowlisted;

    return {
      provider,
      provider_configured:
        configured === true,
      credential_present:
        credentialReady,
      provider_supports_network:
        supportsNetwork,
      provider_allowlisted:
        allowlisted,
      network_requested:
        networkRequested === true,
      global_network_enabled:
        this.globalNetworkEnabled,
      network_call_authorized:
        networkAuthorized,
      operational_authority:false,
      tool_authority:false,
      mutation_authority:false,
      write_authority:false,
      execute_authority:false,
      commit_authority:false,
      push_authority:false,
      deploy_authority:false
    };
  }
}

module.exports = {
  ProviderNetworkGate
};
