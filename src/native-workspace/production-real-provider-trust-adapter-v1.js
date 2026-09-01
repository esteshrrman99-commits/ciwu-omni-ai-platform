'use strict';

const {
  OpenRouterProviderAdapter
} = require(
  './openrouter-provider-adapter-v1'
);

const {
  AuthorizedProviderNetworkTransport
} = require(
  './authorized-provider-network-transport-v1'
);

const {
  AuthorizedProviderTrustChain
} = require(
  './authorized-provider-trust-chain-v1'
);

function codedError(code) {
  const error =
    new Error(code);

  error.code =
    code;

  return error;
}

function zeroAuthority() {
  return Object.freeze({
    operational_authority:false,
    tool_authority:false,
    mutation_authority:false,
    write_authority:false,
    execute_authority:false,
    commit_authority:false,
    push_authority:false,
    deploy_authority:false
  });
}

function buildProductionRealProviderTrustAdapter({
  policy,
  capabilityService,
  credentialResolver,
  fetchImpl,
  stateRoot,
  clock,
  model
} = {}) {
  if (
    !policy ||
    typeof policy !== 'object'
  ) {
    throw codedError(
      'PRODUCTION_REAL_PROVIDER_POLICY_REQUIRED'
    );
  }

  if (
    policy.network_call_authorized !==
      true
  ) {
    throw codedError(
      'PRODUCTION_REAL_PROVIDER_NOT_AUTHORIZED'
    );
  }

  if (
    policy.provider !== 'OPENROUTER'
  ) {
    throw codedError(
      'PRODUCTION_REAL_PROVIDER_IDENTITY_MISMATCH'
    );
  }

  if (
    !capabilityService ||
    typeof capabilityService.evaluate !==
      'function'
  ) {
    throw codedError(
      'PROVIDER_CAPABILITY_SERVICE_REQUIRED'
    );
  }

  if (
    typeof credentialResolver !==
      'function'
  ) {
    throw codedError(
      'PROVIDER_CREDENTIAL_RESOLVER_REQUIRED'
    );
  }

  if (
    typeof fetchImpl !== 'function'
  ) {
    throw codedError(
      'PROVIDER_FETCH_IMPLEMENTATION_REQUIRED'
    );
  }

  if (
    typeof stateRoot !== 'string' ||
    stateRoot.length === 0
  ) {
    throw codedError(
      'PROVIDER_STATE_ROOT_REQUIRED'
    );
  }

  const adapter =
    new OpenRouterProviderAdapter({
      model:
        model ||
        policy.model ||
        'openrouter/free'
    });

  const transport =
    new AuthorizedProviderNetworkTransport({
      providerCapabilityService:
        capabilityService,
      adapter,
      credentialResolver,
      fetchImpl
    });

  const trustChain =
    new AuthorizedProviderTrustChain({
      networkTransport:
        transport,
      stateRoot,
      clock
    });

  /*
   * Runtime-facing complete() adapter.
   *
   * This is the only surface exposed to ProviderRegistry.
   * All network execution remains behind:
   *
   * policy
   *   -> capability service
   *   -> authorized network transport
   *   -> OpenRouter adapter
   *   -> Leap021 quarantine/admission/persistence
   *
   * Provider output remains non-authoritative.
   */
  const completeAdapter =
    Object.freeze({
      async complete(request = {}) {
        const result =
          await trustChain.complete({
            providerName:
              'OPENROUTER',

            request
          });

        if (
          !result ||
          result.ok !== true
        ) {
          return result;
        }

        return {
          content:
            result.content,

          provider:
            'OPENROUTER',

          model:
            result.model ||
            policy.model ||
            null,

          context_admission:
            result.context_admission,

          persistence:
            result.persistence,

          ...zeroAuthority()
        };
      }
    });

  return Object.freeze({
    provider:
      'OPENROUTER',

    model:
      policy.model ||
      'openrouter/free',

    adapter:
      completeAdapter,

    transport,
    trustChain,

    local_fallback:
      'CIWU_DRY_RUN',

    external_provider_called:false,
    model_network_call:false,
    real_provider_credential_used:false,

    authority:
      zeroAuthority()
  });
}

module.exports = {
  buildProductionRealProviderTrustAdapter
};
