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

function approve(
  runtime,
  action,
  payload
) {
  const ticket =
    runtime.approvalStore.create(
      {
        action,
        payload
      },
      '2026-08-30T00:00:00Z'
    );

  runtime.approvalStore.decide(
    ticket.id,
    'APPROVED',
    '2026-08-30T00:01:00Z'
  );

  return ticket;
}

test(
  'approved execution cannot escape project root by traversal absolute path or symlink',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-exec-contain-'
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

      const outside =
        path.join(
          root,
          'outside.js'
        );

      fs.writeFileSync(
        outside,
        'const outside = true;\n',
        'utf8'
      );

      fs.writeFileSync(
        path.join(
          projectRoot,
          'ok.js'
        ),
        'const ok = true;\n',
        'utf8'
      );

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const traversalPayload = {
        request:{
          policy:'node-check',
          args:['../outside.js'],
          timeout_ms:5000,
          max_output_bytes:8192
        }
      };

      const t1 =
        approve(
          runtime,
          'TEST',
          traversalPayload
        );

      const r1 =
        runtime.approvalExecutor.execute(
          t1.id,
          {
            action:'TEST',
            payload:
              traversalPayload
          }
        );

      assert.equal(
        r1.ok,
        false
      );

      assert.equal(
        r1.reason,
        'EXECUTION_PATH_TRAVERSAL_BLOCKED'
      );

      const absolutePayload = {
        request:{
          policy:'node-check',
          args:[outside],
          timeout_ms:5000,
          max_output_bytes:8192
        }
      };

      const t2 =
        approve(
          runtime,
          'TEST',
          absolutePayload
        );

      const r2 =
        runtime.approvalExecutor.execute(
          t2.id,
          {
            action:'TEST',
            payload:
              absolutePayload
          }
        );

      assert.equal(
        r2.ok,
        false
      );

      assert.equal(
        r2.reason,
        'EXECUTION_ABSOLUTE_PATH_BLOCKED'
      );

      let symlinkSupported =
        true;

      const link =
        path.join(
          projectRoot,
          'escape.js'
        );

      try {
        fs.symlinkSync(
          outside,
          link
        );
      } catch (_) {
        symlinkSupported =
          false;
      }

      if (symlinkSupported) {
        const symlinkPayload = {
          request:{
            policy:'node-check',
            args:['escape.js'],
            timeout_ms:5000,
            max_output_bytes:8192
          }
        };

        const t3 =
          approve(
            runtime,
            'TEST',
            symlinkPayload
          );

        const r3 =
          runtime.approvalExecutor.execute(
            t3.id,
            {
              action:'TEST',
              payload:
                symlinkPayload
            }
          );

        assert.equal(
          r3.ok,
          false
        );

        assert.equal(
          r3.reason,
          'EXECUTION_SYMLINK_ESCAPE_BLOCKED'
        );
      }

      const validPayload = {
        request:{
          policy:'node-check',
          args:['ok.js'],
          timeout_ms:5000,
          max_output_bytes:8192
        }
      };

      const t4 =
        approve(
          runtime,
          'TEST',
          validPayload
        );

      const r4 =
        runtime.approvalExecutor.execute(
          t4.id,
          {
            action:'TEST',
            payload:
              validPayload
          }
        );

      assert.equal(
        r4.ok,
        true
      );

      console.log(
        'CIWU_EXECUTION_PATH_CONTAINMENT_PASS'
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
