'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  authorize
} = require('../../src/native-workspace/authority-v1');

const {
  operation
} = require('../../src/native-workspace/workspace-contract-v1');

const {
  route
} = require('../../src/native-workspace/model-router-v1');

const {
  validateMemory
} = require('../../src/native-workspace/memory-kernel-v1');

const {
  validateImport
} = require('../../src/native-workspace/conversation-import-v1');

const {
  plan
} = require('../../src/native-workspace/coding-agent-v1');

test('CIWU native workspace foundation is fail closed', () => {
  assert.equal(authorize('READ').ok, true);
  assert.equal(authorize('WRITE').ok, false);
  assert.equal(authorize('EXECUTE').ok, false);
  assert.equal(authorize('COMMIT').ok, false);
  assert.equal(authorize('PUSH').ok, false);
  assert.equal(authorize('DEPLOY').ok, false);

  assert.equal(operation('READ').mutates, false);
  assert.equal(operation('WRITE'), null);
  assert.equal(operation('PUSH').authority, 'PUSH');

  assert.equal(route({ prompt: 'test' }, {}).ok, false);

  assert.equal(
    validateMemory({
      id: 'm1',
      class: 'PROJECT_FACT',
      content: 'foundation',
      provenance: 'test',
      confidence: 1,
      timestamp: '2026-08-30T00:00:00Z'
    }).ok,
    true
  );

  assert.equal(
    validateMemory({
      id: 'm2'
    }).ok,
    false
  );

  assert.equal(
    validateImport({
      messages: [
        {
          role: 'user',
          content: 'hello'
        }
      ]
    }).ok,
    true
  );

  const denied = plan(
    ['READ', 'UPDATE', 'RUN', 'COMMIT', 'PUSH', 'DEPLOY'],
    []
  );

  assert.equal(denied[0].ok, true);

  for (const entry of denied.slice(1)) {
    assert.equal(entry.ok, false);
  }

  const granted = plan(
    ['UPDATE', 'RUN'],
    ['WRITE', 'EXECUTE']
  );

  assert.equal(granted[0].ok, true);
  assert.equal(granted[1].ok, true);
});

console.log('CIWU_NATIVE_CHAT_CODE_MEMORY_FOUNDATION_PASS');
