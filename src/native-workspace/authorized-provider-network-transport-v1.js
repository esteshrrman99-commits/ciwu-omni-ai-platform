'use strict';

const crypto =
  require('node:crypto');

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function errorWith(code) {
  const error =
    new Error(code);

  error.code = code;

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

function normalizedNetworkProof(
  route
) {
  const policy =
    route &&
    route.policy &&
    typeof route.policy === 'object'
      ? route.policy
      : {};

  return Object.freeze({
    network_call_authorized:
      policy.network_call_authorized ===
        true,

    network_requested:
      policy.network_requested ===
        true,

    global_network_enabled:
      policy.global_network_enabled ===
        true,

    provider_configured:
      policy.provider_configured ===
        true,

    credential_present:
      policy.credential_present ===
        true,

    provider_supports_network:
      policy.provider_supports_network ===
        true,

    provider_allowlisted:
      policy.provider_allowlisted ===
        true,

    ...zeroAuthority()
  });
}

function assertAuthorizationProof(
  proof
) {
  const required = [
    'network_call_authorized',
    'network_requested',
    'global_network_enabled',
    'provider_configured',
    'credential_present',
    'provider_supports_network',
    'provider_allowlisted'
  ];

  for (const key of required) {
    if (proof[key] !== true) {
      throw errorWith(
        'NETWORK_AUTHORIZATION_DENIED'
      );
    }
  }

  return true;
}

class AuthorizedProviderNetworkTransport {
  constructor({
    providerCapabilityService,
    adapter,
    credentialResolver,
    fetchImpl
  } = {}) {
    if (
      !providerCapabilityService ||
      typeof providerCapabilityService
        .evaluate !== 'function'
    ) {
      throw errorWith(
        'PROVIDER_CAPABILITY_SERVICE_REQUIRED'
      );
    }

    if (
      !adapter ||
      typeof adapter.describe !==
        'function' ||
      typeof adapter.invoke !==
        'function'
    ) {
      throw errorWith(
        'NETWORK_PROVIDER_ADAPTER_REQUIRED'
      );
    }

    if (
      typeof credentialResolver !==
        'function'
    ) {
      throw errorWith(
        'CREDENTIAL_RESOLVER_REQUIRED'
      );
    }

    if (
      typeof fetchImpl !==
        'function'
    ) {
      throw errorWith(
        'NETWORK_FETCH_IMPLEMENTATION_REQUIRED'
      );
    }

    this.providerCapabilityService =
      providerCapabilityService;

    this.adapter =
      adapter;

    this.credentialResolver =
      credentialResolver;

    this.fetchImpl =
      fetchImpl;
  }

  async dispatch(body = {}) {
    /*
     * Caller does NOT supply authorization evidence.
     * Existing capability/policy service generates it.
     */
    const policy =
      this.providerCapabilityService
        .evaluate({
          requested_provider:
            body.requested_provider ||
            'OPENROUTER',

          requested_model:
            body.requested_model ||
            'openrouter/free',

          required_capability:
            body.required_capability ||
            'CHAT',

          network_requested:true
        });

    if (
      !policy ||
      policy.ok !== true ||
      !policy.route
    ) {
      return {
        ok:false,
        reason:
          policy &&
          policy.reason
            ? policy.reason
            : 'NETWORK_POLICY_FAILED',

        model_network_call:false,
        external_provider_called:false,
        real_provider_credential_used:
          false,

        ...zeroAuthority()
      };
    }

    const route =
      policy.route;

    const description =
      this.adapter.describe();

    if (
      !description ||
      description.network_capable !==
        true
    ) {
      throw errorWith(
        'NETWORK_CAPABLE_ADAPTER_REQUIRED'
      );
    }

    if (
      route.provider !==
      description.provider
    ) {
      throw errorWith(
        'NETWORK_PROVIDER_IDENTITY_MISMATCH'
      );
    }

    const proof =
      normalizedNetworkProof(
        route
      );

    /*
     * Critical ordering:
     * credential resolver is not touched
     * until every independent network gate
     * is proven true.
     */
    assertAuthorizationProof(
      proof
    );

    const networkAuthorizationSha256 =
      sha({
        provider:
          route.provider,
        model:
          route.model,
        proof
      });

    const request = Object.freeze({
      provider:
        route.provider,

      model:
        route.model,

      instruction:
        String(
          body.current_instruction ||
          body.instruction ||
          ''
        ),

      context:
        Array.isArray(body.context)
          ? body.context
          : [],

      authority:
        zeroAuthority()
    });

    const requestBindingSha256 =
      sha(request);

    const attemptId =
      sha({
        authority:
          'CIWU_AUTHORIZED_PROVIDER_NETWORK_TRANSPORT_V1',
        provider:
          route.provider,
        request_binding_sha256:
          requestBindingSha256,
        network_authorization_sha256:
          networkAuthorizationSha256
      });

    const idempotencyKey =
      sha({
        authority:
          'CIWU_PROVIDER_NETWORK_OPERATION_V1',
        provider:
          route.provider,
        request_binding_sha256:
          requestBindingSha256
      });

    /*
     * Only now may the server-side secret
     * resolver be touched.
     *
     * The credential value is never returned
     * in the result or authorization artifact.
     */
    const credential =
      await this.credentialResolver({
        provider:
          route.provider,
        model:
          route.model
      });

    if (
      typeof credential !==
        'string' ||
      credential.length === 0
    ) {
      throw errorWith(
        'NETWORK_PROVIDER_CREDENTIAL_UNAVAILABLE'
      );
    }

    const response =
      await this.adapter.invoke(
        request,
        {
          networkEnabled:true,
          apiKey:credential,
          fetchImpl:
            this.fetchImpl,
          attemptId,
          idempotencyKey
        }
      );

    if (
      !response ||
      typeof response !== 'object'
    ) {
      throw errorWith(
        'NETWORK_PROVIDER_RESPONSE_INVALID'
      );
    }

    return {
      ok:true,

      provider:
        route.provider,

      model:
        route.model,

      response,

      request_binding_sha256:
        requestBindingSha256,

      network_authorization_sha256:
        networkAuthorizationSha256,

      credential_values_exposed:false,

      route_policy:proof,

      /*
       * These fields describe transport
       * occurrence, NOT operational authority.
       */
      model_network_call:
        response.model_network_call ===
          true,

      external_provider_called:
        response
          .external_provider_called ===
          true,

      real_provider_credential_used:
        response
          .real_provider_credential_used ===
          true,

      ...zeroAuthority()
    };
  }
}

module.exports = {
  AuthorizedProviderNetworkTransport,
  normalizedNetworkProof,
  assertAuthorizationProof
};
