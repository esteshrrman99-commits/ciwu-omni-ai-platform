'use strict';

const test = require('node:test');
const assert =
  require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createRuntime
} = require(
  '../../src/native-workspace/runtime-factory-v1'
);

test(
  'operator resolves uncertain execution without replay',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-operator-resolution-'
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

      fs.mkdirSync(projectRoot);

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

      const resolved =
        second.recoveryService.resolve(
          ticket.id,
          'ABANDONED_UNKNOWN',
          'Outcome cannot be proven.'
        );

      assert.equal(
        resolved.ok,
        true
      );

      assert.equal(
        resolved.execution_replayed,
        false
      );

      assert.match(
        resolved.audit_hash,
        /^[a-f0-9]{64}$/
      );

      const status =
        second.recoveryService.status(
          ticket.id
        );

      assert.equal(
        status.recovery_state,
        'FINALIZED'
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
        'CIWU_OPERATOR_RESOLUTION_NO_REPLAY_PASS'
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
