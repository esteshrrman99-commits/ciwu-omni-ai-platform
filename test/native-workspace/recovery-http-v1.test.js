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

const {
  createHttpServer,
  listenLoopback
} = require(
  '../../src/native-workspace/http-server-v1'
);

test(
  'loopback recovery status and resolution are bounded and non-replaying',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-recovery-http-'
        )
      );

    let server = null;

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

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      server =
        createHttpServer(
          runtime.api
        );

      const address =
        await listenLoopback(
          server,
          0
        );

      const base =
        'http://127.0.0.1:' +
        address.port;

      const statusResponse =
        await fetch(
          base +
          '/api/recovery/' +
          encodeURIComponent(
            ticket.id
          ),
          {
            headers:{
              origin:base
            }
          }
        );

      const status =
        await statusResponse.json();

      assert.equal(
        status.recovery_state,
        'EXECUTION_OUTCOME_UNKNOWN'
      );

      const resolutionResponse =
        await fetch(
          base +
          '/api/recovery/' +
          encodeURIComponent(
            ticket.id
          ) +
          '/resolve',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:
              JSON.stringify({
                resolution:
                  'CONFIRMED_EXECUTED',
                note:
                  'Operator verified external evidence.'
              })
          }
        );

      const resolution =
        await resolutionResponse.json();

      assert.equal(
        resolution.ok,
        true
      );

      assert.equal(
        resolution.execution_replayed,
        false
      );

      console.log(
        'CIWU_RECOVERY_HTTP_OPERATOR_GATE_PASS'
      );
    } finally {
      if (server) {
        await new Promise(
          resolve =>
            server.close(resolve)
        );
      }

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
