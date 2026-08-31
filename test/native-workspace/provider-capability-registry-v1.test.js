'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  ProviderCapabilityRegistry
} = require(
  '../../src/native-workspace/provider-capability-registry-v1'
);

test(
  'provider capability registry is deterministic and exposes capability metadata only',
  () => {
    const registry =
      new ProviderCapabilityRegistry();

    const rows =
      registry.list();

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0].provider,
      'CIWU_DRY_RUN'
    );

    assert.deepEqual(
      rows[0].models,
      ['ciwu-dry-run-v1']
    );

    assert.equal(
      rows[0].supports_network,
      false
    );

    assert.deepEqual(
      rows[0]
        .credential_env_names,
      []
    );

    console.log(
      'CIWU_PROVIDER_CAPABILITY_REGISTRY_PASS'
    );
  }
);
