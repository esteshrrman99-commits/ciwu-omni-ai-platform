'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  ProviderRegistry
} = require(
  '../../src/native-workspace/provider-registry-v1'
);

const {
  LocalDryRunProviderAdapter
} = require(
  '../../src/native-workspace/local-dry-run-provider-adapter-v1'
);

const {
  ChatProviderDispatchBridge
} = require(
  '../../src/native-workspace/chat-provider-dispatch-bridge-v1'
);

test(
  'bridge satisfies chat registry while preserving dispatcher transport',
  async () => {
    const raw =
      new LocalDryRunProviderAdapter();

    const bridge =
      new ChatProviderDispatchBridge({
        provider:
          'CIWU_DRY_RUN',

        adapter:
          raw,

        timeoutMs:
          5000,

        retryLimit:
          0
      });

    assert.equal(
      typeof bridge.complete,
      'function'
    );

    const registry =
      new ProviderRegistry();

    registry.register(
      'CIWU_DRY_RUN',
      bridge,
      {
        enabled: true,
        healthy: true,
        server_side: true
      }
    );

    assert.deepEqual(
      registry.available(),
      ['CIWU_DRY_RUN']
    );

    const entry =
      registry.get(
        'CIWU_DRY_RUN'
      );

    assert.ok(entry);

    const response =
      await entry.adapter.complete({
        model:
          'ciwu-dry-run-v1',

        messages: [
          {
            role: 'user',
            content: 'bridge proof'
          }
        ]
      });

    assert.equal(
      typeof response.content,
      'string'
    );

    assert.ok(
      Array.isArray(
        response.tool_requests
      )
    );

    /*
     * Do not print provider content.
     */
    console.log(
      'CHAT_PROVIDER_BRIDGE_COMPLETE=PASS'
    );

    console.log(
      'PROVIDER_REGISTRY_AVAILABLE=PASS'
    );

    console.log(
      'DISPATCH_PATH=PASS'
    );

    console.log(
      'PROVIDER_CONTENT_PRINTED=NO'
    );
  }
);
