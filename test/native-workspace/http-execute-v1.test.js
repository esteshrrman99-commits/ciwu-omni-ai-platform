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

async function post(
  base,
  route,
  body
) {
  const response =
    await fetch(
      base + route,
      {
        method:'POST',
        headers:{
          'content-type':
            'application/json',
          origin:base
        },
        body:
          JSON.stringify(body)
      }
    );

  return response.json();
}

test(
  'HTTP execution remains allowlisted and release authorities absent',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-http-exec-'
        )
      );

    const projectRoot =
      path.join(
        root,
        'project'
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

    const runtime =
      createRuntime({
        projectRoot,
        stateRoot:
          path.join(
            root,
            'state'
          ),
        projectId:'ciwu',
        providers:[]
      });

    const server =
      createHttpServer(
        runtime.api
      );

    try {
      const address =
        await listenLoopback(
          server,
          0
        );

      const base =
        'http://127.0.0.1:' +
        address.port;

      const payload = {
        request:{
          policy:'node-check',
          args:['ok.js'],
          timeout_ms:5000,
          max_output_bytes:8192
        }
      };

      const request =
        await post(
          base,
          '/api/approvals',
          {
            action:'TEST',
            payload
          }
        );

      await post(
        base,
        '/api/approvals/' +
          request.ticket.id +
          '/decision',
        {
          decision:'APPROVED'
        }
      );

      const executed =
        await post(
          base,
          '/api/transactions/' +
            request.ticket.id +
            '/execute',
          {
            action:'TEST',
            payload
          }
        );

      assert.equal(
        executed.ok,
        true
      );

      assert.equal(
        executed.execution.exit_code,
        0
      );

      for (
        const action of
        ['COMMIT','PUSH','DEPLOY']
      ) {
        const blocked =
          await post(
            base,
            '/api/approvals',
            {
              action,
              payload:{}
            }
          );

        assert.equal(
          blocked.ok,
          false
        );

        assert.equal(
          blocked.reason,
          'RELEASE_AUTHORITY_NOT_EXPOSED'
        );
      }

      console.log(
        'CIWU_HTTP_APPROVAL_BOUND_EXECUTE_PASS'
      );
    } finally {
      await new Promise(
        resolve =>
          server.close(resolve)
      );

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
