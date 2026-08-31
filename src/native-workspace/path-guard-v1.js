'use strict';

const fs = require('node:fs');
const path = require('node:path');

function realRoot(root) {
  return fs.realpathSync(root);
}

function resolveInside(root, candidate, options = {}) {
  const base = realRoot(root);

  if (
    typeof candidate !== 'string' ||
    candidate.length === 0 ||
    candidate.includes('\0')
  ) {
    throw new Error('INVALID_PATH');
  }

  const requested = path.resolve(base, candidate);

  let resolved;

  if (options.allowMissing === true) {
    const parent = fs.realpathSync(path.dirname(requested));
    resolved = path.join(parent, path.basename(requested));
  } else {
    resolved = fs.realpathSync(requested);
  }

  const inside =
    resolved === base ||
    resolved.startsWith(base + path.sep);

  if (!inside) {
    throw new Error('PATH_ESCAPE_BLOCKED');
  }

  return resolved;
}

module.exports = {
  realRoot,
  resolveInside
};
