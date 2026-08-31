'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');
const fs =
  require('node:fs');
const os =
  require('node:os');
const path =
  require('node:path');

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
  'loopback unified context endpoint is bounded read-only and non-authoritative',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-context-http-'
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

      fs.mkdirSync(
        path.join(
          stateRoot,
          'memory'
        ),
        {
          recursive:true
        }
      );

      fs.writeFileSync(
        path.join(
          stateRoot,
          'memory',
          'memory.json'
        ),
        JSON.stringify({
          memories:[
            {
              id:'x',
              content:
                'unified context HTTP evidence',
              confidence:1,
              provenance:'test'
            }
          ]
        }),
        'utf8'
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

      const response =
        await fetch(
          base +
          '/api/context/search',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:
              JSON.stringify({
                query:
                  'unified context',
                limit:10
              })
          }
        );

      const result =
        await response.json();

      assert.equal(
        result.ok,
        true
      );

      assert.equal(
        result.operational_authority,
        false
      );

      assert.equal(
        result.tool_execution_allowed,
        false
      );

      assert.equal(
        result.mutation_authority,
        false
      );

      assert.ok(
        result.results.length >= 1
      );

      assert.equal(
        runtime.approvalStore
          .all()
          .tickets
          .length,
        0
      );

      console.log(
        'CIWU_UNIFIED_CONTEXT_HTTP_PASS'
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
