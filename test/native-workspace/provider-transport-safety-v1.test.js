'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  ProviderDispatcher
} =
  require(
    '../../src/native-workspace/provider-dispatcher-v1'
  );

const {
  LocalDryRunProviderAdapter
} =
  require(
    '../../src/native-workspace/local-dry-run-provider-adapter-v1'
  );

function request(
  content = 'hello'
) {
  return {
    model:'ciwu-dry-run-v1',
    messages:[
      {
        role:'user',
        content
      }
    ]
  };
}

test(
  'timeout aborts underlying invocation and never retries overlapping work',
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
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('timeout'),
        {
          timeout_ms:50,
          retry_limit:2
        }
      );

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      result.reason,
      'PROVIDER_DISPATCH_TIMEOUT'
    );

    /*
     * Timeout itself is not automatically retried.
     * The underlying invocation must settle first.
     */
    assert.equal(
      result.attempts,
      1
    );

    assert.equal(
      adapter.activeInvocations,
      0
    );

    assert.equal(
      adapter.maxConcurrentInvocations,
      1
    );

    assert.equal(
      adapter.invocations,
      1
    );

    assert.ok(
      adapter.abortedInvocations >= 1
    );

    console.log(
      'CIWU_PROVIDER_ABORT_PROPAGATION_PASS'
    );

    console.log(
      'CIWU_PROVIDER_TIMEOUT_NO_OVERLAP_PASS'
    );
  }
);

test(
  'retry occurs only after retryable settled failure',
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
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('retry'),
        {
          timeout_ms:500,
          retry_limit:1
        }
      );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.attempts,
      2
    );

    assert.equal(
      adapter.maxConcurrentInvocations,
      1
    );

    assert.equal(
      adapter.activeInvocations,
      0
    );

    console.log(
      'CIWU_PROVIDER_SETTLED_RETRY_PASS'
    );
  }
);

test(
  'concurrent duplicate logical requests coalesce to one provider operation',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter({
        delayMs:30
      });

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const payload =
      request('duplicate');

    const [a,b] =
      await Promise.all([
        dispatcher.dispatch(
          'CIWU_DRY_RUN',
          payload,
          {
            timeout_ms:500,
            retry_limit:0
          }
        ),
        dispatcher.dispatch(
          'CIWU_DRY_RUN',
          payload,
          {
            timeout_ms:500,
            retry_limit:0
          }
        )
      ]);

    assert.equal(
      adapter.invocations,
      1
    );

    assert.equal(
      adapter.maxConcurrentInvocations,
      1
    );

    assert.equal(
      a.idempotency_key,
      b.idempotency_key
    );

    assert.equal(
      a.dispatch_id,
      b.dispatch_id
    );

    console.log(
      'CIWU_PROVIDER_DUPLICATE_COALESCE_PASS'
    );
  }
);

test(
  'idempotency key is stable for same request and changes for different request',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter();

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const first =
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('same'),
        {
          retry_limit:0
        }
      );

    const second =
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('same'),
        {
          retry_limit:0
        }
      );

    const third =
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('different'),
        {
          retry_limit:0
        }
      );

    assert.equal(
      first.idempotency_key,
      second.idempotency_key
    );

    assert.notEqual(
      first.idempotency_key,
      third.idempotency_key
    );

    assert.equal(
      second.response.idempotent_replay,
      true
    );

    console.log(
      'CIWU_PROVIDER_IDEMPOTENCY_BINDING_PASS'
    );
  }
);

test(
  'dispatch provenance explicitly denies network and late-result authority',
  async () => {
    const adapter =
      new LocalDryRunProviderAdapter();

    const dispatcher =
      new ProviderDispatcher({
        adapters:[adapter]
      });

    const result =
      await dispatcher.dispatch(
        'CIWU_DRY_RUN',
        request('provenance'),
        {
          retry_limit:0
        }
      );

    assert.equal(
      result.dispatch_provenance
        .transport_abort_supported,
      true
    );

    assert.equal(
      result.dispatch_provenance
        .retry_requires_prior_settlement,
      true
    );

    assert.equal(
      result.dispatch_provenance
        .idempotency_bound,
      true
    );

    assert.equal(
      result.dispatch_provenance
        .late_result_authority,
      false
    );

    assert.equal(
      result.dispatch_provenance
        .network_adapter_execution,
      false
    );

    assert.equal(
      result.dispatch_provenance
        .external_provider_called,
      false
    );

    console.log(
      'CIWU_PROVIDER_TRANSPORT_PROVENANCE_PASS'
    );
  }
);
