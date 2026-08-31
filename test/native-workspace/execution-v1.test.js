'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  run
} = require('../../src/native-workspace/execution-sandbox-v1');

test('execution sandbox is allowlisted and authority gated', () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-exec-')
  );

  try {
    fs.writeFileSync(
      path.join(root, 'ok.js'),
      'const x = 1;\n',
      'utf8'
    );

    const denied = run(
      root,
      {
        policy: 'node-check',
        args: ['ok.js']
      },
      []
    );

    assert.equal(denied.ok, false);
    assert.equal(
      denied.reason,
      'EXECUTE_AUTHORIZATION_REQUIRED'
    );

    const unknown = run(
      root,
      {
        policy: 'shell-anything',
        args: ['echo', 'bad']
      },
      ['EXECUTE']
    );

    assert.equal(unknown.ok, false);
    assert.equal(
      unknown.reason,
      'EXECUTION_POLICY_DENIED'
    );

    const allowed = run(
      root,
      {
        policy: 'node-check',
        args: ['ok.js'],
        timeout_ms: 5000,
        max_output_bytes: 8192
      },
      ['EXECUTE']
    );

    assert.equal(allowed.ok, true);
    assert.equal(allowed.exit_code, 0);

    console.log(
      'CIWU_EXECUTION_SANDBOX_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
