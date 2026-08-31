'use strict';

const {
  inspectCredentialPresence,
  assertCredentialReportSafe
} = require(
  './provider-credential-boundary-v1'
);

class ProviderPolicyRouter {
  constructor({
    registry,
    networkGate,
    configuredProviders = [],
    env = process.env
  }) {
    if (
      !registry ||
      !networkGate
    ) {
      throw new Error(
        'PROVIDER_POLICY_DEPENDENCY_REQUIRED'
      );
    }

    this.registry = registry;
    this.networkGate = networkGate;
    this.env = env;

    this.configuredProviders =
      new Set([
        'CIWU_DRY_RUN',
        ...(
          Array.isArray(
            configuredProviders
          )
            ? configuredProviders
            : []
        )
      ]);
  }

  route({
    requested_provider =
      'CIWU_DRY_RUN',
    requested_model,
    required_capability =
      'CHAT',
    network_requested =
      false
  } = {}) {
    const capability =
      this.registry.require(
        requested_provider
      );

    if (
      !capability.capabilities
        .includes(
          required_capability
        )
    ) {
      throw new Error(
        'PROVIDER_CAPABILITY_UNAVAILABLE'
      );
    }

    const model =
      requested_model ||
      capability.models[0];

    if (
      !capability.models.includes(
        model
      )
    ) {
      throw new Error(
        'PROVIDER_MODEL_UNAVAILABLE'
      );
    }

    const credentialReport =
      inspectCredentialPresence({
        envNames:
          capability
            .credential_env_names,
        env:this.env
      });

    assertCredentialReportSafe(
      credentialReport
    );

    const policy =
      this.networkGate.evaluate({
        provider:
          capability.provider,
        capability,
        configured:
          this.configuredProviders
            .has(
              capability.provider
            ),
        credentialReport,
        networkRequested:
          network_requested
      });

    return {
      provider:
        capability.provider,
      model,
      required_capability,
      capability:{
        supports_network:
          capability
            .supports_network,
        capabilities:[
          ...capability
            .capabilities
        ]
      },
      credential:
        credentialReport,
      policy,
      route_authority:
        'POLICY_EVALUATION_ONLY'
    };
  }
}

module.exports = {
  ProviderPolicyRouter
};
