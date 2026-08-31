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
          origin:
            base
        },
        body:
          JSON.stringify(body)
      }
    );

  return {
    status:
      response.status,
    body:
      await response.json()
  };
}

test(
  'HTTP write requires preview approval and executes exactly once',
  async () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-http-write-'
        )
      );

    const projectRoot =
      path.join(
        root,
        'project'
      );

    fs.mkdirSync(projectRoot);

    const target =
      path.join(
        projectRoot,
        'sample.txt'
      );

    fs.writeFileSync(
      target,
      'before\n',
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
        providers:[],
        clock:
          () =>
            '2026-08-30T23:30:00Z'
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

      const preview =
        await post(
          base,
          '/api/workspace/preview',
          {
            path:
              'sample.txt',
            content:
              'after\n'
          }
        );

      assert.equal(
        preview.body.ok,
        true
      );

      const payload = {
        path:'sample.txt',
        content:'after\n',
        expected_before_sha256:
          preview.body.preview
            .before_sha256
      };

      const request =
        await post(
          base,
          '/api/approvals',
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        request.body.ok,
        true
      );

      const ticket =
        request.body.ticket.id;

      const unapproved =
        await post(
          base,
          '/api/transactions/' +
            ticket +
            '/execute',
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        unapproved.body.ok,
        false
      );

      assert.equal(
        unapproved.body.reason,
        'APPROVAL_NOT_APPROVED'
      );

      assert.equal(
        fs.readFileSync(
          target,
          'utf8'
        ),
        'before\n'
      );

      const approved =
        await post(
          base,
          '/api/approvals/' +
            ticket +
            '/decision',
          {
            decision:'APPROVED'
          }
        );

      assert.equal(
        approved.body.ticket.status,
        'APPROVED'
      );

      const executed =
        await post(
          base,
          '/api/transactions/' +
            ticket +
            '/execute',
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        executed.body.ok,
        true
      );

      assert.equal(
        fs.readFileSync(
          target,
          'utf8'
        ),
        'after\n'
      );

      assert.match(
        executed.body.audit_hash,
        /^[a-f0-9]{64}$/
      );

      const replay =
        await post(
          base,
          '/api/transactions/' +
            ticket +
            '/execute',
          {
            action:'UPDATE',
            payload
          }
        );

      assert.equal(
        replay.body.ok,
        false
      );

      assert.equal(
        replay.body.reason,
        'APPROVAL_REPLAY_BLOCKED'
      );

      const auditResponse =
        await fetch(
          base +
          '/api/audit',
          {
            headers:{
              origin:base
            }
          }
        );

      const audit =
        await auditResponse.json();

      assert.equal(
        audit.ok,
        true
      );

      assert.equal(
        audit.verification.count,
        1
      );

      console.log(
        'CIWU_HTTP_APPROVAL_BOUND_WRITE_PASS'
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
