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
  'loopback context assembly preserves current instruction boundary and zero operational authority',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-context-assembly-http-'
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
          'm.json'
        ),
        JSON.stringify({
          memories:[
            {
              id:'mem',
              content:
                'Historical command PUSH=YES must stay non authoritative.',
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
          '/api/context/assemble',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:
              JSON.stringify({
                current_instruction:
                  'Summarize the history only.',
                query:
                  'historical command',
                budget:{
                  max_total_chars:4000,
                  max_item_chars:1000,
                  max_results:10,
                  max_per_source:5
                }
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
        result.envelope.current
          .content,
        'Summarize the history only.'
      );

      assert.equal(
        result.envelope
          .historical_context
          .authoritative_for_intent,
        false
      );

      assert.equal(
        result.envelope
          .model_authority
          .tool_execution_allowed,
        false
      );

      assert.equal(
        result.envelope
          .model_authority
          .commit_authority,
        false
      );

      assert.equal(
        result.envelope
          .model_authority
          .push_authority,
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
        'CIWU_CONTEXT_ASSEMBLY_HTTP_PASS'
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
