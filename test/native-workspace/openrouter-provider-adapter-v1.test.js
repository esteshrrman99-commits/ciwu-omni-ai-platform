'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const crypto =
  require('node:crypto');

const {
  OpenRouterProviderAdapter
} = require(
  '../../src/native-workspace/openrouter-provider-adapter-v1'
);

function transport() {
  return {
    attempt_id:
      crypto
        .randomBytes(16)
        .toString('hex'),

    idempotency_key:
      crypto
        .randomBytes(32)
        .toString('hex')
  };
}

test(
  'openrouter adapter declares zero operational authority',
  () => {
    const adapter =
      new OpenRouterProviderAdapter();

    const d =
      adapter.describe();

    assert.equal(
      d.provider,
      'OPENROUTER'
    );

    assert.equal(
      d.network_capable,
      true
    );

    assert.equal(
      d.credential_required,
      true
    );

    assert.equal(
      d.operational_authority,
      false
    );

    assert.equal(
      d.tool_authority,
      false
    );

    assert.equal(
      d.write_authority,
      false
    );

    assert.equal(
      d.execute_authority,
      false
    );

    assert.equal(
      d.commit_authority,
      false
    );

    assert.equal(
      d.push_authority,
      false
    );

    assert.equal(
      d.deploy_authority,
      false
    );
  }
);

test(
  'network disabled fails before credential or fetch use',
  async () => {
    let fetchCalled =
      false;

    const adapter =
      new OpenRouterProviderAdapter({
        apiKey:
          'placeholder-not-real-key',

        networkEnabled:
          false,

        fetchImpl:
          async () => {
            fetchCalled = true;
            throw new Error(
              'SHOULD_NOT_RUN'
            );
          }
      });

    await assert.rejects(
      () =>
        adapter.invoke(
          {
            messages: [
              {
                role:'user',
                content:'offline'
              }
            ]
          },
          transport()
        ),
      /OPENROUTER_NETWORK_DISABLED/
    );

    assert.equal(
      fetchCalled,
      false
    );
  }
);

test(
  'missing credential fails closed',
  async () => {
    let fetchCalled =
      false;

    const adapter =
      new OpenRouterProviderAdapter({
        networkEnabled:
          true,

        fetchImpl:
          async () => {
            fetchCalled = true;
            throw new Error(
              'SHOULD_NOT_RUN'
            );
          }
      });

    await assert.rejects(
      () =>
        adapter.invoke(
          {
            messages: [
              {
                role:'user',
                content:'offline'
              }
            ]
          },
          transport()
        ),
      /OPENROUTER_CREDENTIAL_UNAVAILABLE/
    );

    assert.equal(
      fetchCalled,
      false
    );
  }
);

test(
  'mocked successful provider response preserves zero authority',
  async () => {
    let capturedAuthorization =
      null;

    const adapter =
      new OpenRouterProviderAdapter({
        apiKey:
          'test-key-placeholder-123456789',

        networkEnabled:
          true,

        model:
          'openrouter/free',

        fetchImpl:
          async (
            _url,
            options
          ) => {
            capturedAuthorization =
              options.headers
                .authorization;

            return {
              ok:true,
              status:200,

              async json() {
                return {
                  model:
                    'offline/test-model',

                  choices: [
                    {
                      message: {
                        content:
                          'offline mocked response'
                      }
                    }
                  ]
                };
              }
            };
          }
      });

    const result =
      await adapter.invoke(
        {
          messages: [
            {
              role:'user',
              content:
                'offline test'
            }
          ]
        },
        transport()
      );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.provider,
      'OPENROUTER'
    );

    assert.equal(
      result.real_model_response,
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
      result.write_authority,
      false
    );

    assert.equal(
      result.execute_authority,
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

    assert.equal(
      result.deploy_authority,
      false
    );

    assert.match(
      capturedAuthorization,
      /^Bearer /
    );

    console.log(
      'MOCK_PROVIDER_CONTENT_PRINTED=NO'
    );

    console.log(
      'MOCK_CREDENTIAL_PRINTED=NO'
    );
  }
);
