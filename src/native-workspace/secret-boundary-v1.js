'use strict';

const SECRET_PATTERN =
  /(api[_-]?key|token|secret|authorization|password)/i;

function redactObject(value) {
  if (Array.isArray(value)) {
    return value.map(redactObject);
  }

  if (value && typeof value === 'object') {
    const out = {};

    for (const [key, item] of Object.entries(value)) {
      out[key] = SECRET_PATTERN.test(key)
        ? '[REDACTED]'
        : redactObject(item);
    }

    return out;
  }

  return value;
}

function assertServerSideProvider(metadata = {}) {
  if (metadata.server_side !== true) {
    throw new Error('PROVIDER_MUST_BE_SERVER_SIDE');
  }

  return true;
}

module.exports = {
  SECRET_PATTERN,
  redactObject,
  assertServerSideProvider
};
