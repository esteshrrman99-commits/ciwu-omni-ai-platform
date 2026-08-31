'use strict';

const fs = require('node:fs');

const {
  authorize
} = require('./authority-v1');

const {
  resolveInside
} = require('./path-guard-v1');

const {
  atomicWriteJson
} = require('./atomic-store-v1');

function writeText(root, relative, content, grants = []) {
  const auth = authorize('WRITE', grants);

  if (!auth.ok) {
    throw new Error('WRITE_AUTHORIZATION_REQUIRED');
  }

  if (typeof content !== 'string') {
    throw new Error('INVALID_CONTENT');
  }

  const file = resolveInside(
    root,
    relative,
    { allowMissing: true }
  );

  fs.writeFileSync(file, content, {
    encoding: 'utf8',
    mode: 0o600
  });

  return {
    ok: true,
    path: relative,
    bytes: Buffer.byteLength(content)
  };
}

function writeJson(root, relative, value, grants = []) {
  const auth = authorize('WRITE', grants);

  if (!auth.ok) {
    throw new Error('WRITE_AUTHORIZATION_REQUIRED');
  }

  const file = resolveInside(
    root,
    relative,
    { allowMissing: true }
  );

  atomicWriteJson(file, value);

  return {
    ok: true,
    path: relative
  };
}

module.exports = {
  writeText,
  writeJson
};
