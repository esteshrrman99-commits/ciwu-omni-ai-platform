'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  assertAdapter
} = require(
  '../../src/native-workspace/provider-adapter-interface-v1'
);

const {
  LocalDryRunProviderAdapter
} = require(
  '../../src/native-workspace/local-dry-run-provider-adapter-v1'
);

const {
  ProviderDispatcher
} = require(
  '../../src/native-workspace/provider-dispatcher-v1'
);

test(
  'local adapter implements provider contract and remains network incapable',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter();

    assert.equal(
      assertAdapter(adapter),
      true
    );

    assert.equal(
      adapter.describe()
        .network_capable,
      false
    );

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const result =
      await dispatcher.dispatch({
        provider:'CIWU_DRY_RUN',
        request:{
          model:'ciwu-dry-run-v1',
          instruction:'test'
        }
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.response
        .external_provider_called,
      false
    );

    assert.equal(
      result.response
        .model_network_call,
      false
    );

    console.log(
      'CIWU_PROVIDER_ADAPTER_INTERFACE_PASS'
    );
  }
);

test(
  'network-capable adapter is rejected before invocation',
  async () => {
    let invoked = false;

    const adapter = {
      describe() {
        return {
          provider:
            'NETWORK_TEST',
          network_capable:true
        };
      },

      async invoke() {
        invoked = true;
        return {};
      }
    };

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    await assert.rejects(
      dispatcher.dispatch({
        provider:
          'NETWORK_TEST',
        request:{
          instruction:'blocked'
        }
      }),
      /NETWORK_CAPABLE_ADAPTER_BLOCKED/
    );

    assert.equal(
      invoked,
      false
    );

    console.log(
      'CIWU_NETWORK_ADAPTER_PREINVOKE_BLOCK_PASS'
    );
  }
);
