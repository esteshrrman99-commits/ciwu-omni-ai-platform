'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createRuntime
} = require('../../src/native-workspace/runtime-factory-v1');

test('approval tickets never execute operations', async () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-approval-')
  );

  try {
    const projectRoot =
      path.join(root, 'project');

    fs.mkdirSync(projectRoot);

    const runtime =
      createRuntime({
        projectRoot,
        stateRoot:
          path.join(root, 'state'),
        projectId: 'ciwu',
        providers: [],
        clock:
          () => '2026-08-30T21:40:00Z'
      });

    const requested =
      await runtime.api.requestApproval({
        action: 'UPDATE',
        payload: {
          path: 'example.js'
        }
      });

    assert.equal(requested.ok, true);
    assert.equal(
      requested.authority,
      'WRITE'
    );

    assert.equal(
      requested.execution_status,
      'NOT_EXECUTED'
    );

    const approved =
      await runtime.api.decideApproval(
        requested.ticket.id,
        'APPROVED'
      );

    assert.equal(
      approved.ticket.status,
      'APPROVED'
    );

    assert.equal(
      approved.ticket.execution_status,
      'NOT_EXECUTED'
    );

    assert.equal(
      approved.execution_status,
      'NOT_EXECUTED'
    );

    const readApproval =
      await runtime.api.requestApproval({
        action: 'READ'
      });

    assert.equal(
      readApproval.ok,
      false
    );

    assert.equal(
      readApproval.reason,
      'READ_DOES_NOT_REQUIRE_APPROVAL'
    );

    console.log(
      'CIWU_APPROVAL_NO_AUTO_EXECUTION_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
