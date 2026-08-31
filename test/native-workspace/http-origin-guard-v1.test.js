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
  'foreign web origins cannot drive CIWU HTTP API',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-origin-'
        )
      );

    const projectRoot =
      path.join(
        root,
        'project'
      );

    fs.mkdirSync(projectRoot);

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

      const response =
        await fetch(
          base +
          '/api/health',
          {
            headers:{
              origin:
                'https://evil.example'
            }
          }
        );

      assert.equal(
        response.status,
        403
      );

      const body =
        await response.json();

      assert.equal(
        body.error.code,
        'FOREIGN_ORIGIN_BLOCKED'
      );

      console.log(
        'CIWU_FOREIGN_ORIGIN_FAIL_CLOSED_PASS'
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
