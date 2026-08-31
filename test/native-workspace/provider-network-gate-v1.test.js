'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  ProviderNetworkGate
} = require(
  '../../src/native-workspace/provider-network-gate-v1'
);

test(
  'configured credential-ready provider remains blocked when global network gate is off',
  () => {
    const gate =
      new ProviderNetworkGate({
        globalNetworkEnabled:false,
        providerAllowlist:[
          'TEST_PROVIDER'
        ]
      });

    const result =
      gate.evaluate({
        provider:
          'TEST_PROVIDER',
        capability:{
          supports_network:true
        },
        configured:true,
        credentialReport:{
          all_present:true
        },
        networkRequested:true
      });

    assert.equal(
      result.provider_configured,
      true
    );

    assert.equal(
      result.credential_present,
      true
    );

    assert.equal(
      result.network_requested,
      true
    );

    assert.equal(
      result.global_network_enabled,
      false
    );

    assert.equal(
      result.network_call_authorized,
      false
    );

    assert.equal(
      result.operational_authority,
      false
    );

    assert.equal(
      result.execute_authority,
      false
    );

    console.log(
      'CIWU_PROVIDER_NETWORK_GATE_FAIL_CLOSED_PASS'
    );
  }
);

test(
  'policy gate authorization requires every independent network condition',
  () => {
    const gate =
      new ProviderNetworkGate({
        globalNetworkEnabled:true,
        providerAllowlist:[
          'TEST_PROVIDER'
        ]
      });

    const result =
      gate.evaluate({
        provider:
          'TEST_PROVIDER',
        capability:{
          supports_network:true
        },
        configured:true,
        credentialReport:{
          all_present:true
        },
        networkRequested:true
      });

    assert.equal(
      result.network_call_authorized,
      true
    );

    assert.equal(
      result.operational_authority,
      false
    );

    assert.equal(
      result.tool_authority,
      false
    );

    assert.equal(
      result.commit_authority,
      false
    );

    assert.equal(
      result.push_authority,
      false
    );

    console.log(
      'CIWU_PROVIDER_NETWORK_GATE_CONJUNCTION_PASS'
    );
  }
);
