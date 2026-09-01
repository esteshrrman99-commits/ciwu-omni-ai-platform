'use strict';

const {
  completeAndPersist
} = require(
  './provider-trust-persistence-v1'
);

function codedError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function zeroAuthority() {
  return Object.freeze({
    operational:false,
    tool:false,
    mutation:false,
    write:false,
    execute:false,
    commit:false,
    push:false,
    deploy:false
  });
}

class AuthorizedProviderTrustChain {
  constructor({
    networkTransport,
    stateRoot,
    clock = () =>
      new Date().toISOString()
  } = {}) {
    if (
      !networkTransport ||
      typeof networkTransport.dispatch !==
        'function'
    ) {
      throw codedError(
        'AUTHORIZED_NETWORK_TRANSPORT_REQUIRED'
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

    if (typeof clock !== 'function') {
      throw codedError(
        'PROVIDER_CLOCK_REQUIRED'
      );
    }

    this.networkTransport =
      networkTransport;

    this.stateRoot =
      stateRoot;

    this.clock =
      clock;
  }

  async complete({
    providerName = 'OPENROUTER',
    request = {}
  } = {}) {
    if (
      typeof providerName !== 'string' ||
      providerName.length === 0
    ) {
      throw codedError(
        'PROVIDER_NAME_REQUIRED'
      );
    }

    /*
     * Leap021 owns provider completion ->
     * quarantine -> admission -> persistence.
     *
     * This registry adapter exposes ONLY the already
     * authorized Leap025 transport through the exact
     * registry.get(name).complete(request) contract.
     */
    const transport =
      this.networkTransport;

    let transportResult = null;

    const provider = {
      async complete(providerRequest) {
        const result =
          await transport.dispatch({
            provider:providerName,
            request:providerRequest
          });

        transportResult = result;

        if (
          !result ||
          result.ok !== true
        ) {
          throw codedError(
            result &&
            typeof result.reason === 'string'
              ? result.reason
              : 'AUTHORIZED_PROVIDER_TRANSPORT_FAILED'
          );
        }

        if (
          !result.response ||
          typeof result.response.text !==
            'string'
        ) {
          throw codedError(
            'AUTHORIZED_PROVIDER_CONTENT_INVALID'
          );
        }

        /*
         * Return only the provider completion shape
         * consumed by the existing certified bridge.
         * Never return credentials.
         */
        return {
          content:
            result.response.text,

          provider:
            result.provider ||
            providerName,

          model:
            result.model ||
            null,

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
    };

    const registry = {
      get(name) {
        if (name !== providerName) {
          return null;
        }

        /*
         * Exact minimum provider descriptor consumed by
         * the certified provider bridge.
         *
         * enabled/healthy describe eligibility only.
         * They grant zero operational authority.
         */
        return {
          adapter:provider,

          metadata:{
            enabled:true,
            healthy:true,
            server_side:true,

            operational_authority:false,
            tool_authority:false,
            mutation_authority:false,
            write_authority:false,
            execute_authority:false,
            commit_authority:false,
            push_authority:false,
            deploy_authority:false
          }
        };
      }
    };

    const persisted =
      await completeAndPersist({
        registry,
        providerName,
        request,
        stateRoot:
          this.stateRoot,
        clock:
          this.clock
      });

    if (
      !persisted ||
      persisted.ok !== true
    ) {
      return persisted;
    }

    if (
      !persisted.context_admission ||
      persisted.context_admission
        .context_class !==
          'NON_AUTHORITATIVE_CONTEXT'
    ) {
      throw codedError(
        'PROVIDER_CONTEXT_AUTHORITY_CLASS_INVALID'
      );
    }

    if (
      persisted.context_admission
        .authoritative_for_intent !==
          false
    ) {
      throw codedError(
        'PROVIDER_CONTEXT_AUTHORITY_ESCALATION'
      );
    }

    if (
      !persisted.persistence ||
      persisted.persistence.state !==
        'PERSISTED_NON_AUTHORITATIVE_CONTEXT'
    ) {
      throw codedError(
        'PROVIDER_TRUST_PERSISTENCE_FAILED'
      );
    }

    const authority =
      zeroAuthority();

    return {
      ...persisted,

      transport_provenance:{
        provider:
          transportResult &&
          transportResult.provider
            ? transportResult.provider
            : providerName,

        model:
          transportResult &&
          transportResult.model
            ? transportResult.model
            : null,

        request_binding_sha256:
          transportResult
            ? transportResult
                .request_binding_sha256 ||
              null
            : null,

        network_authorization_sha256:
          transportResult
            ? transportResult
                .network_authorization_sha256 ||
              null
            : null,

        credential_values_exposed:false
      },

      authority
    };
  }
}

module.exports = {
  AuthorizedProviderTrustChain
};
