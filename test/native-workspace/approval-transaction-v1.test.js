'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createWorkspace
} = require('../../src/native-workspace/workspace-service-v1');

const {
  ApprovalTicketStore
} = require('../../src/native-workspace/approval-ticket-v1');

const {
  AuditLedger
} = require('../../src/native-workspace/audit-ledger-v1');

const {
  ApprovalExecutor
} = require('../../src/native-workspace/approval-executor-v1');

const {
  sha256Text
} = require('../../src/native-workspace/canonical-json-v1');

test('approved WRITE executes once with exact payload and precondition', () => {
  const root = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-transaction-'
    )
  );

  try {
    const project =
      path.join(root, 'project');

    fs.mkdirSync(project);

    const file =
      path.join(project, 'example.txt');

    fs.writeFileSync(
      file,
      'before\n',
      'utf8'
    );

    const workspace =
      createWorkspace(project);

    const approvals =
      new ApprovalTicketStore();

    const audit =
      new AuditLedger(
        path.join(
          root,
          'audit',
          'transactions.jsonl'
        )
      );

    const payload = {
      path: 'example.txt',
      content: 'after\n',
      expected_before_sha256:
        sha256Text('before\n')
    };

    const ticket =
      approvals.create(
        {
          action: 'UPDATE',
          payload
        },
        '2026-08-30T22:00:00Z'
      );

    approvals.decide(
      ticket.id,
      'APPROVED',
      '2026-08-30T22:01:00Z'
    );

    const executor =
      new ApprovalExecutor({
        workspace,
        approvalStore: approvals,
        auditLedger: audit,
        clock:
          () =>
            '2026-08-30T22:02:00Z'
      });

    const result =
      executor.execute(
        ticket.id,
        {
          action: 'UPDATE',
          payload
        }
      );

    assert.equal(result.ok, true);

    assert.equal(
      fs.readFileSync(file, 'utf8'),
      'after\n'
    );

    assert.equal(
      audit.verify().count,
      1
    );

    assert.throws(
      () =>
        executor.execute(
          ticket.id,
          {
            action: 'UPDATE',
            payload
          }
        ),
      /APPROVAL_REPLAY_BLOCKED/
    );

    const restartedExecutor =
      new ApprovalExecutor({
        workspace,
        approvalStore: approvals,
        auditLedger:
          new AuditLedger(
            path.join(
              root,
              'audit',
              'transactions.jsonl'
            )
          )
      });

    assert.throws(
      () =>
        restartedExecutor.execute(
          ticket.id,
          {
            action: 'UPDATE',
            payload
          }
        ),
      /APPROVAL_REPLAY_BLOCKED/
    );

    console.log(
      'CIWU_APPROVAL_BOUND_WRITE_ONCE_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});

test('payload mismatch burns ticket fail closed and does not write', () => {
  const root = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-mismatch-'
    )
  );

  try {
    const project =
      path.join(root, 'project');

    fs.mkdirSync(project);

    fs.writeFileSync(
      path.join(project, 'a.txt'),
      'safe\n',
      'utf8'
    );

    const approvals =
      new ApprovalTicketStore();

    const approvedPayload = {
      path: 'a.txt',
      content: 'approved\n',
      expected_before_sha256:
        sha256Text('safe\n')
    };

    const ticket =
      approvals.create(
        {
          action: 'UPDATE',
          payload:
            approvedPayload
        },
        '2026-08-30T22:10:00Z'
      );

    approvals.decide(
      ticket.id,
      'APPROVED',
      '2026-08-30T22:11:00Z'
    );

    const executor =
      new ApprovalExecutor({
        workspace:
          createWorkspace(project),
        approvalStore: approvals,
        auditLedger:
          new AuditLedger(
            path.join(
              root,
              'audit.jsonl'
            )
          )
      });

    const rejected =
      executor.execute(
        ticket.id,
        {
          action: 'UPDATE',
          payload: {
            ...approvedPayload,
            content: 'different\n'
          }
        }
      );

    assert.equal(
      rejected.ok,
      false
    );

    assert.equal(
      rejected.reason,
      'APPROVAL_PAYLOAD_MISMATCH'
    );

    assert.equal(
      fs.readFileSync(
        path.join(project, 'a.txt'),
        'utf8'
      ),
      'safe\n'
    );

    assert.throws(
      () =>
        executor.execute(
          ticket.id,
          {
            action: 'UPDATE',
            payload:
              approvedPayload
          }
        ),
      /APPROVAL_REPLAY_BLOCKED/
    );

    console.log(
      'CIWU_PAYLOAD_BINDING_FAIL_CLOSED_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});

test('approved bounded execution works and release authorities remain blocked', () => {
  const root = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-execute-ticket-'
    )
  );

  try {
    const project =
      path.join(root, 'project');

    fs.mkdirSync(project);

    fs.writeFileSync(
      path.join(project, 'ok.js'),
      'const x = 1;\n',
      'utf8'
    );

    const approvals =
      new ApprovalTicketStore();

    const request = {
      policy: 'node-check',
      args: ['ok.js'],
      timeout_ms: 5000,
      max_output_bytes: 8192
    };

    const payload = { request };

    const ticket =
      approvals.create(
        {
          action: 'TEST',
          payload
        },
        '2026-08-30T22:20:00Z'
      );

    approvals.decide(
      ticket.id,
      'APPROVED',
      '2026-08-30T22:21:00Z'
    );

    const audit =
      new AuditLedger(
        path.join(root, 'audit.jsonl')
      );

    const executor =
      new ApprovalExecutor({
        workspace:
          createWorkspace(project),
        approvalStore: approvals,
        auditLedger: audit
      });

    const result =
      executor.execute(
        ticket.id,
        {
          action: 'TEST',
          payload
        }
      );

    assert.equal(result.ok, true);

    assert.equal(
      result.execution.exit_code,
      0
    );

    const commitTicket =
      approvals.create(
        {
          action: 'COMMIT',
          payload: {
            message: 'forbidden'
          }
        },
        '2026-08-30T22:30:00Z'
      );

    approvals.decide(
      commitTicket.id,
      'APPROVED',
      '2026-08-30T22:31:00Z'
    );

    const blocked =
      executor.execute(
        commitTicket.id,
        {
          action: 'COMMIT',
          payload: {
            message: 'forbidden'
          }
        }
      );

    assert.equal(
      blocked.ok,
      false
    );

    assert.equal(
      blocked.reason,
      'GIT_RELEASE_AUTHORITY_OUT_OF_SCOPE'
    );

    console.log(
      'CIWU_APPROVAL_BOUND_EXECUTE_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
