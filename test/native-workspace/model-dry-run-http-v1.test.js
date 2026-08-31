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
  'loopback model dry run exposes provenance but performs no provider network call',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-model-http-'
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
          '/api/model/dry-run',
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
                  'Return a dry run only.',
                metadata:{
                  client_secret:
                    'do-not-expose'
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
        result.model_network_call,
        false
      );

      assert.equal(
        result.real_provider_credential_used,
        false
      );

      assert.equal(
        result.request.metadata
          .client_secret,
        '[REDACTED]'
      );

      assert.equal(
        result.response.provenance
          .real_model_response,
        false
      );

      assert.equal(
        result.response.authority
          .commit_authority,
        false
      );

      assert.equal(
        result.response.authority
          .deploy_authority,
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
        'CIWU_MODEL_DRY_RUN_HTTP_PASS'
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
