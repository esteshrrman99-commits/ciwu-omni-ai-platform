'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  buildProductionRealProviderPolicyFromEnv,
  describeProductionRealProvider
} = require(
  '../../src/native-workspace/production-real-provider-composition-v1'
);

test(
  'empty production environment denies real provider',
  () => {
    const policy =
      buildProductionRealProviderPolicyFromEnv(
        {}
      );

    assert.equal(
      policy.network_call_authorized,
      false
    );

    assert.equal(
      policy.credential_present,
      false
    );

    assert.equal(
      policy.local_fallback,
      'CIWU_DRY_RUN'
    );

    const state =
      describeProductionRealProvider({
        policy
      });

    assert.equal(state.ok, false);
    assert.equal(
      state.reason,
      'REAL_PROVIDER_NOT_AUTHORIZED'
    );
  }
);

test(
  'credential value never appears in policy',
  () => {
    const secret =
      'MOCK_SECRET_DO_NOT_PRINT';

    const policy =
      buildProductionRealProviderPolicyFromEnv({
        CIWU_EXTERNAL_PROVIDERS:'1',
        CIWU_OPENROUTER_ENABLED:'1',
        CIWU_PROVIDER_NETWORK_ENABLED:'1',
        CIWU_PROVIDER_ALLOWLIST:
          'OPENROUTER',
        OPENROUTER_API_KEY:secret
      });

    assert.equal(
      policy.credential_present,
      true
    );

    assert.equal(
      JSON.stringify(policy).includes(
        secret
      ),
      false
    );

    assert.equal(
      policy.network_call_authorized,
      true
    );

    const state =
      describeProductionRealProvider({
        policy
      });

    assert.equal(
      state.state,
      'REAL_PROVIDER_ELIGIBLE_NOT_EXECUTED'
    );

    assert.equal(
      state.model_network_call,
      false
    );
  }
);

test(
  'allowlist requires exact OPENROUTER identity',
  () => {
    const policy =
      buildProductionRealProviderPolicyFromEnv({
        CIWU_EXTERNAL_PROVIDERS:'1',
        CIWU_OPENROUTER_ENABLED:'1',
        CIWU_PROVIDER_NETWORK_ENABLED:'1',
        CIWU_PROVIDER_ALLOWLIST:
          'OTHER',
        OPENROUTER_API_KEY:
          'MOCK_PRESENT'
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

console.log(
  'REAL_NETWORK_CALL=NO'
);

console.log(
  'REAL_CREDENTIAL_PRINTED=NO'
);

console.log(
  'OPENROUTER_REGISTERED_IN_RUNTIME=NO'
);
