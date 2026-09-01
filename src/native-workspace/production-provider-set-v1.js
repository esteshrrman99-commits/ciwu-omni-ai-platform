'use strict';

const {
  buildProductionRealProviderRuntimeBinding
} = require(
  './production-real-provider-runtime-binding-v1'
);

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

function buildProductionProviderSet({
  localAdapter,
  realPolicy,
  realAdapter
} = {}) {
  if (
    !localAdapter ||
    typeof localAdapter.complete !== 'function'
  ) {
    throw new Error(
      'CIWU_DRY_RUN_ADAPTER_REQUIRED'
    );
  }

  const local =
    Object.freeze({
      name:'CIWU_DRY_RUN',

      adapter:localAdapter,

      metadata:Object.freeze({
        enabled:true,
        healthy:true,
        server_side:true,
        external_provider:false,
        network_capable:false,
        ...zeroAuthority()
      })
    });

  const providers = [local];

  let realProviderState =
    'REAL_PROVIDER_NOT_REGISTERED';

  if (
    realPolicy &&
    realPolicy.network_call_authorized === true
  ) {
    const binding =
      buildProductionRealProviderRuntimeBinding({
        policy:realPolicy,
        adapter:realAdapter
      });

    if (
      binding.registered === true &&
      binding.providers.length === 1
    ) {
      providers.push(
        binding.providers[0]
      );

      realProviderState =
        'REAL_PROVIDER_REGISTERED_NOT_EXECUTED';
    }
  }

  return Object.freeze({
    providers:Object.freeze(providers),

    local_fallback:'CIWU_DRY_RUN',

    real_provider_state:
      realProviderState,

    external_provider_called:false,
    model_network_call:false,
    real_provider_credential_used:false,

    authority:
      zeroAuthority()
  });
}

module.exports = {
  buildProductionProviderSet
};
