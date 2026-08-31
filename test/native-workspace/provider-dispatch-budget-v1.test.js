'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

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
  'retry budget is bounded and transient local failure succeeds exactly within allowance',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter({
        failuresBeforeSuccess:1
      });

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const result =
      await dispatcher.dispatch({
        provider:'CIWU_DRY_RUN',
        request:{
          model:'ciwu-dry-run-v1',
          instruction:'retry proof'
        },
        budget:{
          retry_limit:1,
          timeout_ms:500
        }
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.attempts,
      2
    );

    assert.equal(
      adapter.invocations,
      2
    );

    console.log(
      'CIWU_PROVIDER_RETRY_BUDGET_PASS'
    );
  }
);

test(
  'timeout fails closed with bounded attempts',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter({
        delayMs:200
      });

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const result =
      await dispatcher.dispatch({
        provider:'CIWU_DRY_RUN',
        request:{
          instruction:
            'timeout proof'
        },
        budget:{
          timeout_ms:50,
          retry_limit:0
        }
      });

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      result.reason,
      'PROVIDER_DISPATCH_TIMEOUT'
    );

    assert.equal(
      result.attempts,
      1
    );

    console.log(
      'CIWU_PROVIDER_TIMEOUT_FAIL_CLOSED_PASS'
    );
  }
);

test(
  'input budget rejects oversized provider request before adapter invocation',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter();

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    await assert.rejects(
      dispatcher.dispatch({
        provider:'CIWU_DRY_RUN',
        request:{
          instruction:
            'x'.repeat(1000)
        },
        budget:{
          max_input_chars:256
        }
      }),
      /PROVIDER_INPUT_BUDGET_EXCEEDED/
    );

    assert.equal(
      adapter.invocations,
      0
    );

    console.log(
      'CIWU_PROVIDER_INPUT_BUDGET_PASS'
    );
  }
);
