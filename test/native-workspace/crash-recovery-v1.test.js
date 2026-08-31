'use strict';

const test = require('node:test');
const assert =
  require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const {
  createRuntime
} = require(
  '../../src/native-workspace/runtime-factory-v1'
);

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

test(
  'WRITE crash after mutation recovers without second mutation',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-write-crash-'
        )
      );

    try {
      const projectRoot =
        path.join(
          root,
          'project'
        );

      const stateRoot =
        path.join(
          root,
          'state'
        );

      fs.mkdirSync(
        projectRoot
      );

      const target =
        path.join(
          projectRoot,
          'state.txt'
        );

      fs.writeFileSync(
        target,
        'before\n',
        'utf8'
      );

      let injected = false;

      const first =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[],
          faultInjector(stage) {
            if (
              stage ===
              'AFTER_WRITE_BEFORE_JOURNAL' &&
              !injected
            ) {
              injected = true;
              throw new Error(
                'INJECTED_WRITE_CRASH'
              );
            }
          }
        });

      const payload = {
        path:'state.txt',
        content:'after\n',
        expected_before_sha256:
          sha('before\n')
      };

      const ticket =
        first.approvalStore.create(
          {
            action:'UPDATE',
            payload
          },
          '2026-08-30T00:00:00Z'
        );

      first.approvalStore.decide(
        ticket.id,
        'APPROVED',
        '2026-08-30T00:01:00Z'
      );

      assert.throws(
        () =>
          first.approvalExecutor.execute(
            ticket.id,
            {
              action:'UPDATE',
              payload
            }
          ),
        /INJECTED_WRITE_CRASH/
      );

      assert.equal(
        fs.readFileSync(
          target,
          'utf8'
        ),
        'after\n'
      );

      const second =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const recovered =
        second.approvalExecutor.execute(
          ticket.id,
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        recovered.ok,
        true
      );

      assert.equal(
        recovered.recovered,
        true
      );

      assert.equal(
        second.auditLedger
          .verify()
          .count,
        1
      );

      const replay =
        second.approvalExecutor.execute(
          ticket.id,
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        replay.ok,
        false
      );

      assert.equal(
        replay.reason,
        'APPROVAL_REPLAY_BLOCKED'
      );

      console.log(
        'CIWU_WRITE_CRASH_IDEMPOTENCY_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);

test(
  'EXECUTE crash enters durable manual-recovery state and never auto-reruns',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-exec-crash-'
        )
      );

    try {
      const projectRoot =
        path.join(
          root,
          'project'
        );

      const stateRoot =
        path.join(
          root,
          'state'
        );

      fs.mkdirSync(
        projectRoot
      );

      fs.writeFileSync(
        path.join(
          projectRoot,
          'ok.js'
        ),
        'const x = 1;\n',
        'utf8'
      );

      let injected = false;

      const first =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[],
          faultInjector(stage) {
            if (
              stage ===
              'AFTER_EXECUTE_BEFORE_JOURNAL' &&
              !injected
            ) {
              injected = true;
              throw new Error(
                'INJECTED_EXECUTE_CRASH'
              );
            }
          }
        });

      const payload = {
        request:{
          policy:'node-check',
          args:['ok.js'],
          timeout_ms:5000,
          max_output_bytes:8192
        }
      };

      const ticket =
        first.approvalStore.create(
          {
            action:'TEST',
            payload
          },
          '2026-08-30T00:00:00Z'
        );

      first.approvalStore.decide(
        ticket.id,
        'APPROVED',
        '2026-08-30T00:01:00Z'
      );

      assert.throws(
        () =>
          first.approvalExecutor.execute(
            ticket.id,
            {
              action:'TEST',
              payload
            }
          ),
        /INJECTED_EXECUTE_CRASH/
      );

      const second =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const recovered =
        second.approvalExecutor.execute(
          ticket.id,
          {
            action:'TEST',
            payload
          }
        );

      assert.equal(
        recovered.ok,
        false
      );

      assert.equal(
        recovered.reason,
        'EXECUTION_RECOVERY_MANUAL_REQUIRED'
      );

      assert.equal(
        second.auditLedger
          .verify()
          .count,
        1
      );

      const replay =
        second.approvalExecutor.execute(
          ticket.id,
          {
            action:'TEST',
            payload
          }
        );

      assert.equal(
        replay.ok,
        false
      );

      assert.equal(
        replay.reason,
        'APPROVAL_REPLAY_BLOCKED'
      );

      console.log(
        'CIWU_EXECUTE_AT_MOST_ONCE_CRASH_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);
