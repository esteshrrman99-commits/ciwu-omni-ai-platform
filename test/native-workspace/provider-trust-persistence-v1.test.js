'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  completeAndPersist
} = require(
  '../../src/native-workspace/provider-trust-persistence-v1'
);

function registryWith(content) {
  const provider = {
    metadata: {
      enabled: true,
      healthy: true,
      server_side: true
    },
    adapter: {
      async complete() {
        return {
          content,
          tool_requests: [],
          usage: {
            input_tokens: 1,
            output_tokens: 1
          }
        };
      }
    }
  };

  return {
    get(name) {
      return name === 'OPENROUTER'
        ? provider
        : null;
    }
  };
}

async function main() {
  const root =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-leap022-c1-'
      )
    );

  try {
    const result =
      await completeAndPersist({
        registry:
          registryWith(
            'CIWU_C1_PROVIDER_CONTENT'
          ),
        providerName: 'OPENROUTER',
        request: {
          prompt: 'bounded test'
        },
        stateRoot: root,
        clock: () =>
          '2026-08-31T00:00:00.000Z'
      });

    /*
     * If the certified Leap021 persistence schema rejects the
     * bridge-derived envelope, fail closed and expose the exact
     * schema reason. We do not weaken Leap021 to make this pass.
     */
    if (result.ok !== true) {
      console.error(
        'C1_RESULT=' +
        JSON.stringify(result, null, 2)
      );

      throw new Error(
        'C1_PERSISTENCE_NOT_YET_BOUND'
      );
    }

    assert.strictEqual(
      result.content,
      'CIWU_C1_PROVIDER_CONTENT'
    );

    assert.strictEqual(
      result.context_admission.context_class,
      'NON_AUTHORITATIVE_CONTEXT'
    );

    assert.strictEqual(
      result.context_admission.authoritative_for_intent,
      false
    );

    assert.strictEqual(
      result.authority.operational,
      false
    );

    assert.strictEqual(
      result.authority.tool,
      false
    );

    assert.strictEqual(
      result.authority.write,
      false
    );

    assert.strictEqual(
      result.authority.execute,
      false
    );

    assert.strictEqual(
      result.authority.commit,
      false
    );

    assert.strictEqual(
      result.authority.push,
      false
    );

    assert.strictEqual(
      result.authority.deploy,
      false
    );

    assert.strictEqual(
      result.persistence.state,
      'PERSISTED_NON_AUTHORITATIVE_CONTEXT'
    );

    console.log(
      'LEAP022_C1_DEDICATED_TEST=PASS'
    );
  } finally {
    fs.rmSync(
      root,
      {
        recursive: true,
        force: true
      }
    );
  }
}

main().catch(error => {
  console.error(
    'LEAP022_C1_DEDICATED_TEST=FAIL'
  );
  console.error(
    String(
      error &&
      error.stack
        ? error.stack
        : error
    )
  );
  process.exit(1);
});
