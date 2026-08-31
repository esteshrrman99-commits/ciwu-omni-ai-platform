'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

const {
  resolveInside
} = require('./path-guard-v1');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function previewReplace(root, relative, nextContent) {
  if (typeof nextContent !== 'string') {
    throw new Error('INVALID_CONTENT');
  }

  const file = resolveInside(root, relative);
  const current = fs.readFileSync(file, 'utf8');

  return {
    path: relative,
    before_sha256: sha256(current),
    after_sha256: sha256(nextContent),
    changed: current !== nextContent,
    before_bytes: Buffer.byteLength(current),
    after_bytes: Buffer.byteLength(nextContent),
    proposed_content: nextContent
  };
}

module.exports = {
  sha256,
  previewReplace
};
