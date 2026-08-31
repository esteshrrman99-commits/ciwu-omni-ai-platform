'use strict';

const crypto = require('node:crypto');

function canonicalize(value) {
  if (value === null) return 'null';

  if (
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('NON_FINITE_NUMBER');
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '[' +
      value.map(canonicalize).join(',') +
      ']';
  }

  if (typeof value === 'object') {
    const keys =
      Object.keys(value).sort();

    return '{' +
      keys.map(key =>
        JSON.stringify(key) +
        ':' +
        canonicalize(value[key])
      ).join(',') +
      '}';
  }

  throw new Error('UNSUPPORTED_CANONICAL_VALUE');
}

function sha256Canonical(value) {
  return crypto
    .createHash('sha256')
    .update(canonicalize(value))
    .digest('hex');
}

function sha256Text(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

module.exports = {
  canonicalize,
  sha256Canonical,
  sha256Text
};
