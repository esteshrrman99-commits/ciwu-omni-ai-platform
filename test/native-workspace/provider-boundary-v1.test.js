'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ProviderRegistry
} = require('../../src/native-workspace/provider-registry-v1');

const {
  complete
} = require('../../src/native-workspace/provider-bridge-v1');

const {
  redactObject,
  assertServerSideProvider
} = require('../../src/native-workspace/secret-boundary-v1');

test('provider secrets stay server-side and unavailable providers fail closed', async () => {
  const redacted = redactObject({
    provider: 'example',
    api_key: 'super-secret',
    nested: {
      authorization: 'Bearer abc',
      safe: 'visible'
    }
  });

  assert.equal(redacted.api_key, '[REDACTED]');
  assert.equal(
    redacted.nested.authorization,
    '[REDACTED]'
  );

  assert.equal(
    redacted.nested.safe,
    'visible'
  );

  assert.throws(
    () =>
      assertServerSideProvider({
        server_side: false
      }),
    /PROVIDER_MUST_BE_SERVER_SIDE/
  );

  const registry =
    new ProviderRegistry();

  registry.register(
    'DISABLED',
    {
      async complete() {
        return {
          content: 'should not run'
        };
      }
    },
    {
      enabled: false,
      healthy: true,
      server_side: true
    }
  );

  const result = await complete(
    registry,
    'DISABLED',
    {
      messages: []
    }
  );

  assert.equal(result.ok, false);
  assert.equal(
    result.reason,
    'PROVIDER_NOT_READY'
  );

  console.log(
    'CIWU_PROVIDER_SECRET_BOUNDARY_PASS'
  );
});
