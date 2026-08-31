'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createWorkspace
} = require('../../src/native-workspace/workspace-service-v1');

test('workspace browsing is contained and edits require authority', () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-workspace-')
  );

  try {
    fs.mkdirSync(
      path.join(root, 'src'),
      { recursive: true }
    );

    fs.writeFileSync(
      path.join(root, 'src', 'example.js'),
      'console.log("one");\n',
      'utf8'
    );

    const ws = createWorkspace(root);

    const entries = ws.list('src');

    assert.equal(
      entries.some(e => e.name === 'example.js'),
      true
    );

    assert.equal(
      ws.read('src/example.js'),
      'console.log("one");\n'
    );

    const preview = ws.previewEdit(
      'src/example.js',
      'console.log("two");\n'
    );

    assert.equal(preview.changed, true);

    assert.throws(
      () => ws.write(
        'src/example.js',
        'console.log("two");\n',
        []
      ),
      /WRITE_AUTHORIZATION_REQUIRED/
    );

    ws.write(
      'src/example.js',
      'console.log("two");\n',
      ['WRITE']
    );

    assert.equal(
      ws.read('src/example.js'),
      'console.log("two");\n'
    );

    assert.throws(
      () => ws.read('../outside.txt'),
      /(ENOENT|PATH_ESCAPE_BLOCKED)/
    );

    console.log(
      'CIWU_WORKSPACE_BROWSER_SAFE_EDIT_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
