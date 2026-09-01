'use strict';

const {
  PROVIDER_NAME
} = require(
  './production-real-provider-composition-v1'
);

function zeroAuthorityMetadata() {
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

function assertCompleteAdapter(adapter) {
  if (
    !adapter ||
    typeof adapter.complete !== 'function'
  ) {
    const error =
      new Error(
        'REAL_PROVIDER_COMPLETE_ADAPTER_REQUIRED'
      );

    error.code =
      'REAL_PROVIDER_COMPLETE_ADAPTER_REQUIRED';

    throw error;
  }
}

function buildProductionRealProviderRuntimeBinding({
  policy,
  adapter
} = {}) {
  /*
   * Runtime registration is allowed only after the
   * independently-built production policy has authorized
   * every required gate.
   *
   * Eligibility still does NOT execute the provider.
   */

  if (
    !policy ||
    typeof policy !== 'object' ||
    policy.network_call_authorized !== true
  ) {
    return Object.freeze({
      registered:false,
      reason:
        'REAL_PROVIDER_RUNTIME_REGISTRATION_DENIED',

      provider:
        PROVIDER_NAME,

      local_fallback:
        'CIWU_DRY_RUN',

      providers:
        Object.freeze([]),

      external_provider_called:false,
      model_network_call:false,
      real_provider_credential_used:false,

      authority:
        zeroAuthorityMetadata()
    });
  }

  assertCompleteAdapter(adapter);

  const metadata =
    Object.freeze({
      enabled:true,
      healthy:true,
      server_side:true,

      external_provider:true,
      network_capable:true,

      ...zeroAuthorityMetadata()
    });

  const descriptor =
    Object.freeze({
      name:
        PROVIDER_NAME,

      adapter,

      metadata
    });

  return Object.freeze({
    registered:true,

    state:
      'REAL_PROVIDER_RUNTIME_DESCRIPTOR_READY_NOT_EXECUTED',

    provider:
      PROVIDER_NAME,

    local_fallback:
      'CIWU_DRY_RUN',

    providers:
      Object.freeze([
        descriptor
      ]),

    external_provider_called:false,
    model_network_call:false,
    real_provider_credential_used:false,

    authority:
      zeroAuthorityMetadata()
  });
}

module.exports = {
  buildProductionRealProviderRuntimeBinding
};
