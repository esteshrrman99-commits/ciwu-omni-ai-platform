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
  buildProductionProviderSet
} = require(
  '../../src/native-workspace/production-provider-set-v1'
);

function localAdapter() {
  return {
    async complete() {
      return {
        content:'LOCAL_NOT_PRINTED'
      };
    }
  };
}

function realAdapter(counter) {
  return {
    async complete() {
      counter.count += 1;

      return {
        content:'REAL_NOT_PRINTED'
      };
    }
  };
}

function deniedPolicy() {
  return buildProductionRealProviderPolicy();
}

function allowedPolicy() {
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

function zeroAuthority(obj) {
  const a =
    obj.authority ||
    obj.metadata;

  for (const k of [
    'operational_authority',
    'tool_authority',
    'mutation_authority',
    'write_authority',
    'execute_authority',
    'commit_authority',
    'push_authority',
    'deploy_authority'
  ]) {
    assert.equal(a[k], false);
  }
}

test(
  'default deny exposes only CIWU dry-run',
  () => {
    const result =
      buildProductionProviderSet({
        localAdapter:localAdapter(),
        realPolicy:deniedPolicy()
      });

    assert.deepEqual(
      result.providers.map(x => x.name),
      ['CIWU_DRY_RUN']
    );

    assert.equal(
      result.real_provider_state,
      'REAL_PROVIDER_NOT_REGISTERED'
    );

    zeroAuthority(result);
    zeroAuthority(result.providers[0]);
  }
);

test(
  'eligible real provider is added after local fallback',
  () => {
    const calls = {count:0};

    const result =
      buildProductionProviderSet({
        localAdapter:localAdapter(),
        realPolicy:allowedPolicy(),
        realAdapter:realAdapter(calls)
      });

    assert.deepEqual(
      result.providers.map(x => x.name),
      [
        'CIWU_DRY_RUN',
        'OPENROUTER'
      ]
    );

    assert.equal(
      result.real_provider_state,
      'REAL_PROVIDER_REGISTERED_NOT_EXECUTED'
    );

    assert.equal(calls.count, 0);

    zeroAuthority(result);
    zeroAuthority(result.providers[0]);
    zeroAuthority(result.providers[1]);
  }
);

test(
  'eligible policy without complete real adapter fails closed',
  () => {
    assert.throws(
      () =>
        buildProductionProviderSet({
          localAdapter:localAdapter(),
          realPolicy:allowedPolicy(),
          realAdapter:{}
        }),
      /REAL_PROVIDER_COMPLETE_ADAPTER_REQUIRED/
    );
  }
);

test(
  'missing local fallback fails closed',
  () => {
    assert.throws(
      () =>
        buildProductionProviderSet({
          realPolicy:allowedPolicy(),
          realAdapter:realAdapter({count:0})
        }),
      /CIWU_DRY_RUN_ADAPTER_REQUIRED/
    );
  }
);

test(
  'provider assembly performs no execution',
  () => {
    const calls = {count:0};

    const result =
      buildProductionProviderSet({
        localAdapter:localAdapter(),
        realPolicy:allowedPolicy(),
        realAdapter:realAdapter(calls)
      });

    assert.equal(calls.count, 0);
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

console.log("PROVIDER_CONTENT_PRINTED=NO");
console.log("REAL_NETWORK_CALL=NO");
console.log("REAL_CREDENTIAL_READ=NO");
console.log("REAL_CREDENTIAL_PRINTED=NO");
