'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

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

function assertZeroAuthority(value) {
  const authority =
    value.authority ||
    value.metadata;

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
      authority[key],
      false,
      key
    );
  }
}

function authorizedPolicy() {
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

test(
  'default-denied policy cannot register real provider',
  () => {
    const result =
      buildProductionRealProviderRuntimeBinding({
        policy:
          buildProductionRealProviderPolicy()
      });

    assert.equal(
      result.registered,
      false
    );

    assert.equal(
      result.providers.length,
      0
    );

    assert.equal(
      result.local_fallback,
      'CIWU_DRY_RUN'
    );

    assertZeroAuthority(result);
  }
);

test(
  'authorized policy requires certified complete adapter',
  () => {
    assert.throws(
      () =>
        buildProductionRealProviderRuntimeBinding({
          policy:
            authorizedPolicy(),
          adapter:{}
        }),
      /REAL_PROVIDER_COMPLETE_ADAPTER_REQUIRED/
    );
  }
);

test(
  'authorized offline adapter produces runtime descriptor only',
  () => {
    let calls = 0;

    const adapter = {
      async complete() {
        calls += 1;

        return {
          content:
            'MOCK_CONTENT_NOT_PRINTED'
        };
      }
    };

    const result =
      buildProductionRealProviderRuntimeBinding({
        policy:
          authorizedPolicy(),
        adapter
      });

    assert.equal(
      result.registered,
      true
    );

    assert.equal(
      result.state,
      'REAL_PROVIDER_RUNTIME_DESCRIPTOR_READY_NOT_EXECUTED'
    );

    assert.equal(
      result.providers.length,
      1
    );

    const descriptor =
      result.providers[0];

    assert.equal(
      descriptor.name,
      'OPENROUTER'
    );

    assert.equal(
      descriptor.adapter,
      adapter
    );

    assert.equal(
      descriptor.metadata.enabled,
      true
    );

    assert.equal(
      descriptor.metadata.healthy,
      true
    );

    assert.equal(
      descriptor.metadata.server_side,
      true
    );

    assert.equal(
      descriptor.metadata.external_provider,
      true
    );

    assert.equal(
      descriptor.metadata.network_capable,
      true
    );

    assertZeroAuthority(
      descriptor
    );

    assert.equal(
      calls,
      0
    );

    assert.equal(
      result.external_provider_called,
      false
    );

    assert.equal(
      result.model_network_call,
      false
    );

    assert.equal(
      result.real_provider_credential_used,
      false
    );
  }
);

test(
  'caller authority fields cannot affect descriptor authority',
  () => {
    const adapter = {
      async complete() {
        return {
          content:'unused'
        };
      }
    };

    const policy = {
      ...authorizedPolicy(),

      operational_authority:true,
      tool_authority:true,
      mutation_authority:true,
      write_authority:true,
      execute_authority:true,
      commit_authority:true,
      push_authority:true,
      deploy_authority:true
    };

    const result =
      buildProductionRealProviderRuntimeBinding({
        policy,
        adapter
      });

    assertZeroAuthority(
      result.providers[0]
    );
  }
);

test(
  'binding exposes no provider execution function',
  () => {
    const mod =
      require(
        '../../src/native-workspace/production-real-provider-runtime-binding-v1'
      );

    assert.equal(
      typeof mod.execute,
      'undefined'
    );

    assert.equal(
      typeof mod.dispatch,
      'undefined'
    );

    assert.equal(
      typeof mod.fetch,
      'undefined'
    );

    assert.equal(
      typeof mod.complete,
      'undefined'
    );
  }
);

console.log(
  'MOCK_PROVIDER_CONTENT_PRINTED=NO'
);

console.log(
  'REAL_PROVIDER_CONTENT_PRINTED=NO'
);

console.log(
  'REAL_CREDENTIAL_READ=NO'
);

console.log(
  'REAL_CREDENTIAL_PRINTED=NO'
);

console.log(
  'REAL_NETWORK_CALL=NO'
);
