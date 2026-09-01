'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const {
  buildProductionRealProviderPolicy
} = require(
  '../../src/native-workspace/production-real-provider-composition-v1'
);

const {
  buildProductionRealProviderRuntimeBinding
} = require(
  '../../src/native-workspace/production-real-provider-runtime-binding-v1'
);

const {
  buildProductionRealProviderTrustAdapter
} = require(
  '../../src/native-workspace/production-real-provider-trust-adapter-v1'
);

function policy() {
  return buildProductionRealProviderPolicy({
    externalProvidersEnabled:true,
    openRouterEnabled:true,
    openRouterCredentialPresent:true,
    networkEnabled:true,
    providerAllowlist:[
      'OPENROUTER'
    ]
  });
}

function tempRoot() {
  return fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-a2-a4-'
    )
  );
}

function capabilityServiceAllowed() {
  return {
    async evaluate({
      provider,
      network_requested
    }) {
      assert.equal(
        provider,
        'OPENROUTER'
      );

      assert.equal(
        network_requested,
        true
      );

      return {
        provider:
          'OPENROUTER',

        network_call_authorized:true,
        network_requested:true,
        global_network_enabled:true,
        provider_configured:true,
        credential_present:true,
        provider_supports_network:true,
        provider_allowlisted:true,

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

function mockFetch() {
  return async () => ({
    ok:true,
    status:200,

    async json() {
      return {
        id:'mock-response',
        model:'mock-openrouter-model',
        choices:[
          {
            message:{
              content:
                'MOCK_PROVIDER_CONTENT_DO_NOT_PRINT'
            }
          }
        ]
      };
    }
  });
}

test(
  'production trust adapter builds certified complete surface',
  async () => {
    let credentialCalls = 0;
    let fetchCalls = 0;

    const rawFetch =
      mockFetch();

    const built =
      buildProductionRealProviderTrustAdapter({
        policy:policy(),

        capabilityService:
          capabilityServiceAllowed(),

        credentialResolver:
          async () => {
            credentialCalls += 1;

            return {
              ok:true,
              credential:
                'MOCK_CREDENTIAL_DO_NOT_PRINT'
            };
          },

        fetchImpl:
          async (...args) => {
            fetchCalls += 1;
            return rawFetch(...args);
          },

        stateRoot:
          tempRoot(),

        clock:
          () =>
            '2026-09-01T00:00:00.000Z'
      });

    assert.equal(
      built.provider,
      'OPENROUTER'
    );

    assert.equal(
      typeof built.adapter.complete,
      'function'
    );

    assert.equal(
      credentialCalls,
      0
    );

    assert.equal(
      fetchCalls,
      0
    );

    assert.equal(
      built.local_fallback,
      'CIWU_DRY_RUN'
    );

    /*
     * Merely building the adapter does not execute
     * provider work.
     */
    assert.equal(
      built.external_provider_called,
      false
    );

    assert.equal(
      built.model_network_call,
      false
    );

    assert.equal(
      built.real_provider_credential_used,
      false
    );
  }
);

test(
  'runtime descriptor accepts trust adapter without executing it',
  async () => {
    let credentialCalls = 0;
    let fetchCalls = 0;

    const built =
      buildProductionRealProviderTrustAdapter({
        policy:policy(),

        capabilityService:
          capabilityServiceAllowed(),

        credentialResolver:
          async () => {
            credentialCalls += 1;

            return {
              ok:true,
              credential:
                'MOCK_CREDENTIAL'
            };
          },

        fetchImpl:
          async () => {
            fetchCalls += 1;

            return mockFetch()();
          },

        stateRoot:
          tempRoot()
      });

    const runtime =
      buildProductionRealProviderRuntimeBinding({
        policy:policy(),
        adapter:
          built.adapter
      });

    assert.equal(
      runtime.registered,
      true
    );

    assert.equal(
      runtime.providers.length,
      1
    );

    assert.equal(
      runtime.providers[0].name,
      'OPENROUTER'
    );

    assert.equal(
      credentialCalls,
      0
    );

    assert.equal(
      fetchCalls,
      0
    );

    assert.equal(
      runtime.state,
      'REAL_PROVIDER_RUNTIME_DESCRIPTOR_READY_NOT_EXECUTED'
    );
  }
);

test(
  'denied policy cannot construct trust adapter',
  () => {
    assert.throws(
      () =>
        buildProductionRealProviderTrustAdapter({
          policy:
            buildProductionRealProviderPolicy(),

          capabilityService:
            capabilityServiceAllowed(),

          credentialResolver:
            async () => ({
              credential:'unused'
            }),

          fetchImpl:
            mockFetch(),

          stateRoot:
            tempRoot()
        }),
      /PRODUCTION_REAL_PROVIDER_NOT_AUTHORIZED/
    );
  }
);

test(
  'caller cannot inject authority through policy',
  () => {
    const maliciousPolicy = {
      ...policy(),

      operational_authority:true,
      tool_authority:true,
      mutation_authority:true,
      write_authority:true,
      execute_authority:true,
      commit_authority:true,
      push_authority:true,
      deploy_authority:true
    };

    const built =
      buildProductionRealProviderTrustAdapter({
        policy:
          maliciousPolicy,

        capabilityService:
          capabilityServiceAllowed(),

        credentialResolver:
          async () => ({
            credential:'unused'
          }),

        fetchImpl:
          mockFetch(),

        stateRoot:
          tempRoot()
      });

    for (const key of [
      'operational_authority',
      'tool_authority',
      'mutation_authority',
      'write_authority',
      'execute_authority',
      'commit_authority',
      'push_authority',
      'deploy_authority'
    ]) {
      assert.equal(
        built.authority[key],
        false
      );
    }
  }
);

console.log(
  'MOCK_PROVIDER_CONTENT_PRINTED=NO'
);

console.log(
  'MOCK_CREDENTIAL_PRINTED=NO'
);

console.log(
  'REAL_PROVIDER_CONTENT_PRINTED=NO'
);

console.log(
  'REAL_CREDENTIAL_PRINTED=NO'
);

console.log(
  'REAL_NETWORK_CALL=NO'
);
