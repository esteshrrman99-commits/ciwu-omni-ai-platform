'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  PROVIDER_NAME,
  DEFAULT_MODEL,
  buildProductionRealProviderPolicy,
  describeProductionRealProvider
} = require(
  '../../src/native-workspace/production-real-provider-composition-v1'
);

function zero(result) {
  assert.ok(result.authority);

  for (const key of [
    'operational',
    'tool',
    'mutation',
    'write',
    'execute',
    'commit',
    'push',
    'deploy'
  ]) {
    assert.equal(
      result.authority[key],
      false
    );
  }
}

test(
  'production real provider defaults fail closed',
  () => {
    const policy =
      buildProductionRealProviderPolicy();

    assert.equal(
      policy.provider,
      PROVIDER_NAME
    );

    assert.equal(
      policy.model,
      DEFAULT_MODEL
    );

    assert.equal(
      policy.network_call_authorized,
      false
    );

    assert.equal(
      policy.local_fallback,
      'CIWU_DRY_RUN'
    );

    zero(policy);

    const result =
      describeProductionRealProvider({
        policy
      });

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      result.reason,
      'REAL_PROVIDER_NOT_AUTHORIZED'
    );

    assert.equal(
      result.external_provider_called,
      false
    );

    zero(result);
  }
);

test(
  'each independent production gate is required',
  () => {
    const base = {
      externalProvidersEnabled:true,
      openRouterEnabled:true,
      openRouterCredentialPresent:true,
      networkEnabled:true,
      providerAllowlist:[
        'OPENROUTER'
      ]
    };

    for (const key of [
      'externalProvidersEnabled',
      'openRouterEnabled',
      'openRouterCredentialPresent',
      'networkEnabled'
    ]) {
      const input = {
        ...base,
        [key]:false
      };

      assert.equal(
        buildProductionRealProviderPolicy(
          input
        ).network_call_authorized,
        false,
        key
      );
    }

    assert.equal(
      buildProductionRealProviderPolicy({
        ...base,
        providerAllowlist:[]
      }).network_call_authorized,
      false
    );
  }
);

test(
  'all gates produce eligibility but never execution',
  () => {
    const policy =
      buildProductionRealProviderPolicy({
        externalProvidersEnabled:true,
        openRouterEnabled:true,
        openRouterCredentialPresent:true,
        networkEnabled:true,
        providerAllowlist:[
          'OPENROUTER'
        ]
      });

    assert.equal(
      policy.network_call_authorized,
      true
    );

    const result =
      describeProductionRealProvider({
        policy
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.state,
      'REAL_PROVIDER_ELIGIBLE_NOT_EXECUTED'
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

    assert.equal(
      result.local_fallback,
      'CIWU_DRY_RUN'
    );

    zero(result);
  }
);

test(
  'caller cannot create operational authority',
  () => {
    const policy =
      buildProductionRealProviderPolicy({
        externalProvidersEnabled:true,
        openRouterEnabled:true,
        openRouterCredentialPresent:true,
        networkEnabled:true,
        providerAllowlist:[
          'OPENROUTER'
        ],

        operational:true,
        tool:true,
        write:true,
        execute:true,
        commit:true,
        push:true,
        deploy:true
      });

    zero(policy);
  }
);

test(
  'provider allowlist is exact',
  () => {
    const policy =
      buildProductionRealProviderPolicy({
        externalProvidersEnabled:true,
        openRouterEnabled:true,
        openRouterCredentialPresent:true,
        networkEnabled:true,
        providerAllowlist:[
          'OPENROUTER_OTHER'
        ]
      });

    assert.equal(
      policy.provider_allowlisted,
      false
    );

    assert.equal(
      policy.network_call_authorized,
      false
    );
  }
);

test(
  'composition does not expose execution surfaces',
  () => {
    const mod =
      require(
        '../../src/native-workspace/production-real-provider-composition-v1'
      );

    assert.equal(
      typeof mod.fetch,
      'undefined'
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
      typeof mod.complete,
      'undefined'
    );
  }
);

console.log(
  'REAL_NETWORK_CALL=NO'
);

console.log(
  'REAL_CREDENTIAL_READ=NO'
);

console.log(
  'REAL_CREDENTIAL_PRINTED=NO'
);

console.log(
  'PRODUCTION_MUTATION=NO'
);
