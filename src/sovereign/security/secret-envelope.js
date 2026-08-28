'use strict';

const crypto = require('node:crypto');

function fingerprint(secret) {
  if (
    typeof secret !== 'string' ||
    secret.length < 8
  ) {
    throw new Error(
      'SECRET_TOO_SHORT_OR_MISSING'
    );
  }

  return crypto
    .createHash('sha256')
    .update(secret)
    .digest('hex');
}

function describe(secret) {
  return {
    present: true,
    bytes:
      Buffer.byteLength(
        secret,
        'utf8'
      ),
    sha256:
      fingerprint(secret),
    value:
      '[REDACTED]'
  };
}

module.exports = {
  fingerprint,
  describe
};
