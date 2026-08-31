'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createRuntime
} = require('../../src/native-workspace/runtime-factory-v1');

const {
  createHttpServer,
  listenLoopback
} = require('../../src/native-workspace/http-server-v1');

async function request(base, route, options = {}) {
  const response = await fetch(
    base + route,
    options
  );

  const type =
    response.headers.get('content-type') || '';

  return {
    status: response.status,
    body:
      type.includes('application/json')
        ? await response.json()
        : await response.text()
  };
}

test('loopback HTTP API exposes safe native workspace surfaces', async () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-http-')
  );

  const projectRoot =
    path.join(root, 'project');

  const stateRoot =
    path.join(root, 'state');

  fs.mkdirSync(projectRoot, {
    recursive: true
  });

  fs.writeFileSync(
    path.join(projectRoot, 'hello.txt'),
    'hello ciwu\n',
    'utf8'
  );

  const runtime =
    createRuntime({
      projectRoot,
      stateRoot,
      projectId: 'ciwu',
      clock:
        () => '2026-08-30T21:30:00Z',
      providers: [{
        name: 'MOCK',
        metadata: {
          enabled: true,
          healthy: true,
          server_side: true
        },
        adapter: {
          async complete() {
            return {
              content: 'CIWU mock response',
              tool_requests: []
            };
          }
        }
      }]
    });

  const server =
    createHttpServer(runtime.api);

  try {
    const address =
      await listenLoopback(server, 0);

    assert.equal(
      address.address,
      '127.0.0.1'
    );

    const base =
      `http://127.0.0.1:${address.port}`;

    const ui =
      await request(base, '/');

    assert.equal(ui.status, 200);
    assert.match(
      ui.body,
      /CIWU Native Chat/
    );

    const health =
      await request(
        base,
        '/api/health'
      );

    assert.equal(health.body.ok, true);

    assert.equal(
      health.body.authority.write_http,
      true
    );

    assert.equal(
      health.body.authority.execute_http,
      true
    );

    assert.equal(
      health.body.authority.commit_http,
      false
    );

    assert.equal(
      health.body.authority.push_http,
      false
    );

    assert.equal(
      health.body.authority.deploy_http,
      false
    );

    assert.equal(
      health.body.mutation_policy,
      'APPROVAL_BOUND_ONE_TIME'
    );

    const file =
      await request(
        base,
        '/api/workspace/read?path=hello.txt'
      );

    assert.equal(
      file.body.content,
      'hello ciwu\n'
    );

    const chat =
      await request(
        base,
        '/api/chat',
        {
          method: 'POST',
          headers: {
            'content-type':
              'application/json'
          },
          body: JSON.stringify({
            conversation_id: 'c1',
            provider: 'MOCK',
            content: 'hello'
          })
        }
      );

    assert.equal(chat.body.ok, true);

    assert.equal(
      chat.body.envelope.content,
      'CIWU mock response'
    );

    console.log(
      'CIWU_NATIVE_HTTP_UI_BRIDGE_PASS'
    );
  } finally {
    await new Promise(resolve =>
      server.close(resolve)
    );

    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
