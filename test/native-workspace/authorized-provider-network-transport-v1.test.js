'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  AuthorizedProviderNetworkTransport
} =
  require(
    '../../src/native-workspace/authorized-provider-network-transport-v1'
  );

function authorityZero(value) {
  assert.equal(
    value.operational_authority,
    false
  );

  assert.equal(
    value.tool_authority,
    false
  );

  assert.equal(
    value.mutation_authority,
    false
  );

  assert.equal(
    value.write_authority,
    false
  );

  assert.equal(
    value.execute_authority,
    false
  );

  assert.equal(
    value.commit_authority,
    false
  );

  assert.equal(
    value.push_authority,
    false
  );

  assert.equal(
    value.deploy_authority,
    false
  );
}

function authorizedRoute() {
  return {
    ok:true,

    route:{
      provider:
        'OPENROUTER',

      model:
        'openrouter/free',

      policy:{
        network_call_authorized:true,
        network_requested:true,
        global_network_enabled:true,
        provider_configured:true,
        credential_present:true,
        provider_supports_network:true,
        provider_allowlisted:true
      }
    }
  };
}

function fakeAdapter({
  invocation
}) {
  return {
    describe() {
      return {
        provider:
          'OPENROUTER',
        network_capable:true
      };
    },

    async invoke(
      request,
      transport
    ) {
      invocation.count += 1;
      invocation.request =
        request;
      invocation.transport =
        transport;

      return {
        ok:true,
        provider:'OPENROUTER',
        text:
          'OFFLINE_MOCK_PROVIDER_RESPONSE',

        model_network_call:true,
        external_provider_called:true,
        real_provider_credential_used:
          true,

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
}

test(
  'denied network policy cannot reach credential resolver or adapter',
  async () => {
    let credentialReads = 0;

    const invocation = {
      count:0
    };

    const service =
      new AuthorizedProviderNetworkTransport({
        providerCapabilityService:{
          evaluate() {
            return {
              ok:false,
              reason:
                'NETWORK_NOT_AUTHORIZED'
            };
          }
        },

        adapter:
          fakeAdapter({
            invocation
          }),

        credentialResolver:
          async () => {
            credentialReads += 1;
            return 'NEVER';
          },

        fetchImpl:
          async () => {
            throw new Error(
              'FETCH_MUST_NOT_RUN'
            );
          }
      });

    const result =
      await service.dispatch({});

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      credentialReads,
      0
    );

    assert.equal(
      invocation.count,
      0
    );

    authorityZero(result);
  }
);

test(
  'missing one independent hard gate denies before secret resolution',
  async () => {
    let credentialReads = 0;

    const invocation = {
      count:0
    };

    const policy =
      authorizedRoute();

    policy.route.policy
      .provider_allowlisted =
        false;

    const service =
      new AuthorizedProviderNetworkTransport({
        providerCapabilityService:{
          evaluate() {
            return policy;
          }
        },

        adapter:
          fakeAdapter({
            invocation
          }),

        credentialResolver:
          async () => {
            credentialReads += 1;
            return 'NEVER';
          },

        fetchImpl:
          async () => ({})
      });

    await assert.rejects(
      service.dispatch({}),
      /NETWORK_AUTHORIZATION_DENIED/
    );

    assert.equal(
      credentialReads,
      0
    );

    assert.equal(
      invocation.count,
      0
    );
  }
);

test(
  'authorized offline transport resolves server credential only after policy pass',
  async () => {
    let credentialReads = 0;

    const invocation = {
      count:0
    };

    const service =
      new AuthorizedProviderNetworkTransport({
        providerCapabilityService:{
          evaluate(input) {
            assert.equal(
              input.network_requested,
              true
            );

            return authorizedRoute();
          }
        },

        adapter:
          fakeAdapter({
            invocation
          }),

        credentialResolver:
          async ({
            provider
          }) => {
            credentialReads += 1;

            assert.equal(
              provider,
              'OPENROUTER'
            );

            return 'MOCK_SECRET';
          },

        /*
         * Offline placeholder only.
         * The fake adapter never calls it.
         */
        fetchImpl:
          async () => {
            throw new Error(
              'REAL_NETWORK_FORBIDDEN'
            );
          }
      });

    const result =
      await service.dispatch({
        current_instruction:
          'offline test'
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      credentialReads,
      1
    );

    assert.equal(
      invocation.count,
      1
    );

    assert.equal(
      invocation.transport
        .networkEnabled,
      true
    );

    assert.equal(
      invocation.transport.apiKey,
      'MOCK_SECRET'
    );

    assert.match(
      invocation.transport.attemptId,
      /^[a-f0-9]{64}$/
    );

    assert.match(
      invocation.transport
        .idempotencyKey,
      /^[a-f0-9]{64}$/
    );

    assert.match(
      result
        .request_binding_sha256,
      /^[a-f0-9]{64}$/
    );

    assert.match(
      result
        .network_authorization_sha256,
      /^[a-f0-9]{64}$/
    );

    assert.equal(
      result
        .credential_values_exposed,
      false
    );

    authorityZero(result);
  }
);

test(
  'caller authority escalation is discarded before provider invocation',
  async () => {
    const invocation = {
      count:0
    };

    const service =
      new AuthorizedProviderNetworkTransport({
        providerCapabilityService:{
          evaluate() {
            return authorizedRoute();
          }
        },

        adapter:
          fakeAdapter({
            invocation
          }),

        credentialResolver:
          async () =>
            'MOCK_SECRET',

        fetchImpl:
          async () => ({})
      });

    const result =
      await service.dispatch({
        operational_authority:true,
        tool_authority:true,
        mutation_authority:true,
        write_authority:true,
        execute_authority:true,
        commit_authority:true,
        push_authority:true,
        deploy_authority:true
      });

    assert.equal(
      invocation.count,
      1
    );

    authorityZero(
      invocation.request.authority
    );

    authorityZero(result);
  }
);

test(
  'provider identity mismatch fails before credential resolution',
  async () => {
    let credentialReads = 0;

    const service =
      new AuthorizedProviderNetworkTransport({
        providerCapabilityService:{
          evaluate() {
            return authorizedRoute();
          }
        },

        adapter:{
          describe() {
            return {
              provider:
                'WRONG_PROVIDER',
              network_capable:true
            };
          },

          async invoke() {
            throw new Error(
              'MUST_NOT_INVOKE'
            );
          }
        },

        credentialResolver:
          async () => {
            credentialReads += 1;
            return 'NEVER';
          },

        fetchImpl:
          async () => ({})
      });

    await assert.rejects(
      service.dispatch({}),
      /NETWORK_PROVIDER_IDENTITY_MISMATCH/
    );

    assert.equal(
      credentialReads,
      0
    );
  }
);

console.log(
  'MOCK_PROVIDER_CONTENT_PRINTED=NO'
);

console.log(
  'MOCK_CREDENTIAL_PRINTED=NO'
);

console.log(
  'REAL_NETWORK_CALL=NO'
);

console.log(
  'OPERATIONAL_AUTHORITY=0'
);
