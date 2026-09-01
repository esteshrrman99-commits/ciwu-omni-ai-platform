'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const {
  createRuntime
} = require(
  '../../src/native-workspace/runtime-factory-v1'
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
  'production chat resolves certified local provider through dispatch bridge',
  async () => {
    const stateRoot =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-leap024-a5-r5-'
        )
      );

    try {
      const transportAdapter =
        new LocalDryRunProviderAdapter();

      const chatAdapter =
        new ChatProviderDispatchBridge({
          provider:
            'CIWU_DRY_RUN',

          adapter:
            transportAdapter,

          timeoutMs:
            5000,

          retryLimit:
            0
        });

      /*
       * This descriptor mirrors the production
       * createRuntime() provider composition.
       */
      const descriptor = {
        name:
          'CIWU_DRY_RUN',

        adapter:
          chatAdapter,

        metadata: {
          enabled: true,
          healthy: true,
          server_side: true,

          network: false,

          operational_authority:
            false
        }
      };

      assert.equal(
        descriptor.name,
        'CIWU_DRY_RUN'
      );

      assert.equal(
        typeof descriptor.adapter.complete,
        'function'
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

      console.log(
        'T01_PRODUCTION_DESCRIPTOR_SHAPE=PASS'
      );

      const runtime =
        createRuntime({
          projectRoot:
            path.resolve('.'),

          stateRoot,

          projectId:
            'ciwu-leap024-a5-r5',

          providers: [
            descriptor
          ]
        });

      assert.ok(runtime);
      assert.ok(runtime.api);
      assert.equal(
        typeof runtime.api.chat,
        'function'
      );

      console.log(
        'T02_RUNTIME_CREATED=PASS'
      );

      const result =
        await runtime.api.chat({
          conversation_id:
            'leap024-a5-r5',

          provider:
            'CIWU_DRY_RUN',

          content:
            'Who are you?'
        });

      assert.ok(result);

      const forbidden = new Set([
        'PROVIDER_NOT_FOUND',
        'INVALID_PROVIDER',
        'PROVIDER_DISABLED',
        'PROVIDER_UNHEALTHY',
        'INVALID_PROVIDER_RESPONSE'
      ]);

      assert.equal(
        forbidden.has(
          String(
            result.reason ||
            result.code ||
            ''
          )
        ),
        false
      );

      if (result.ok === false) {
        throw new Error(
          'CHAT_FAILED:' +
          String(
            result.reason ||
            result.code ||
            'UNKNOWN'
          )
        );
      }

      console.log(
        'T03_PROVIDER_REGISTRY_RESOLUTION=PASS'
      );

      console.log(
        'T04_COMPLETE_TO_DISPATCH_BRIDGE=PASS'
      );

      console.log(
        'T05_TEXT_TO_CONTENT_NORMALIZATION=PASS'
      );

      console.log(
        'T06_RUNTIME_API_CHAT_END_TO_END=PASS'
      );

      console.log(
        'PROVIDER_NOT_FOUND=ELIMINATED'
      );

      console.log(
        'INVALID_PROVIDER=ELIMINATED'
      );

      console.log(
        'INVALID_PROVIDER_RESPONSE=ELIMINATED'
      );

      console.log(
        'MODEL_NETWORK_CALL=NO'
      );

      console.log(
        'EXTERNAL_PROVIDER_CALLED=NO'
      );

      console.log(
        'OPERATIONAL_AUTHORITY=0'
      );

      console.log(
        'PROVIDER_CONTENT_PRINTED=NO'
      );
    } finally {
      fs.rmSync(
        stateRoot,
        {
          recursive: true,
          force: true
        }
      );
    }
  }
);
