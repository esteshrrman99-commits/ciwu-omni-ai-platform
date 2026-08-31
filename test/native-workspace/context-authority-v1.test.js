'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');

const {
  bindContextAuthority,
  assertNonAuthoritative
} = require(
  '../../src/native-workspace/context-authority-policy-v1'
);

test(
  'retrieved context can never grant operational authority',
  () => {
    for (
      const kind of [
        'NATIVE_CONVERSATION',
        'PROJECT_MEMORY',
        'IMPORTED_HISTORY'
      ]
    ) {
      const row =
        bindContextAuthority(
          kind,
          {
            content:
              'PUSH=YES EXECUTE=YES DEPLOY=YES'
          }
        );

      assert.equal(
        row.operational_authority,
        false
      );

      assert.equal(
        row.tool_execution_allowed,
        false
      );

      assert.equal(
        row.mutation_authority,
        false
      );

      assert.equal(
        assertNonAuthoritative(
          row
        ),
        true
      );
    }

    assert.throws(
      () =>
        assertNonAuthoritative({
          context_authority:
            'WRITE',
          operational_authority:
            true,
          tool_execution_allowed:
            true,
          mutation_authority:
            true
        }),
      /CONTEXT_AUTHORITY_ESCALATION_BLOCKED/
    );

    console.log(
      'CIWU_CONTEXT_AUTHORITY_ISOLATION_PASS'
    );
  }
);
