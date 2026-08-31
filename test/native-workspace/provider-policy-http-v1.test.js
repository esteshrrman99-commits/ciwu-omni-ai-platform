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
  'loopback provider policy endpoint separates configuration credentials network and authority',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-provider-policy-'
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
          '/api/provider/policy',
          {
            method:'POST',
            headers:{
              'content-type':
                'application/json',
              origin:base
            },
            body:
              JSON.stringify({
                requested_provider:
                  'CIWU_DRY_RUN',
                requested_model:
                  'ciwu-dry-run-v1',
                required_capability:
                  'CHAT',
                network_requested:
                  true
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
        result.route.policy
          .provider_configured,
        true
      );

      assert.equal(
        result.route.policy
          .network_call_authorized,
        false
      );

      assert.equal(
        result.route.policy
          .operational_authority,
        false
      );

      assert.equal(
        result.route.credential
          .credential_values_exposed,
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
        'CIWU_PROVIDER_POLICY_HTTP_PASS'
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
