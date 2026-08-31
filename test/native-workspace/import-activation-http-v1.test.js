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
  'loopback activation and search remain read-only and authority inert',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-import-http-'
        )
      );

    let server = null;

    try {
      const projectRoot =
        path.join(root,'project');

      const stateRoot =
        path.join(root,'state');

      fs.mkdirSync(projectRoot);

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const staged =
        runtime.importMigrationService.stage(
          {
            id:'conv-http',
            title:'HTTP Import',
            messages:[
              {
                id:'m1',
                role:'user',
                content:
                  'searchable historical provenance'
              }
            ]
          },
          {
            source_name:'http.json'
          }
        );

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

      const activateResponse =
        await fetch(
          base +
          '/api/imports/' +
          staged.source_sha256 +
          '/activate',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:'{}'
          }
        );

      const activated =
        await activateResponse.json();

      assert.equal(
        activated.ok,
        true
      );

      const searchResponse =
        await fetch(
          base +
          '/api/imports/search',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:
              JSON.stringify({
                query:'historical provenance',
                limit:10
              })
          }
        );

      const searched =
        await searchResponse.json();

      assert.equal(
        searched.ok,
        true
      );

      assert.equal(
        searched.authority,
        'READ_IMPORT_ONLY'
      );

      assert.equal(
        searched.results[0]
          .tool_execution_allowed,
        false
      );

      assert.equal(
        runtime.approvalStore
          .all()
          .tickets
          .length,
        0
      );

      console.log(
        'CIWU_IMPORT_ACTIVATION_HTTP_PASS'
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
