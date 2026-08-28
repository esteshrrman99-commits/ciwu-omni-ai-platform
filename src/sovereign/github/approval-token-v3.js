'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function issue({
  intentHash,
  baseCommit,
  expiresAt
}) {
  if (!intentHash)
    throw new Error(
      'INTENT_HASH_REQUIRED'
    );

  if (
    !/^[0-9a-f]{40}$/
      .test(
        String(baseCommit || '')
      )
  ) {
    throw new Error(
      'BASE_COMMIT_INVALID'
    );
  }

  const expiry =
    Date.parse(expiresAt);

  if (
    !Number.isFinite(expiry) ||
    expiry <= Date.now()
  ) {
    throw new Error(
      'APPROVAL_EXPIRY_INVALID'
    );
  }

  const base = {
    schema:
      'CIWU_GITHUB_APPROVAL_TOKEN_V3',

    tokenId:
      crypto.randomUUID(),

    intentHash,
    baseCommit,
    expiresAt:
      new Date(expiry)
        .toISOString(),

    used:
      false,

    issuedAt:
      new Date().toISOString()
  };

  return {
    ...base,
    tokenHash:
      hash(base)
  };
}

function verify({
  token,
  intentHash,
  currentBaseCommit,
  now = Date.now()
}) {
  if (!token)
    return {
      valid: false,
      reason:
        'TOKEN_MISSING'
    };

  if (token.used === true)
    return {
      valid: false,
      reason:
        'TOKEN_ALREADY_USED'
    };

  const copy = {
    ...token
  };

  delete copy.tokenHash;

  if (
    hash(copy) !==
    token.tokenHash
  ) {
    return {
      valid: false,
      reason:
        'TOKEN_HASH_MISMATCH'
    };
  }

  if (
    token.intentHash !==
    intentHash
  ) {
    return {
      valid: false,
      reason:
        'INTENT_MISMATCH'
    };
  }

  if (
    token.baseCommit !==
    currentBaseCommit
  ) {
    return {
      valid: false,
      reason:
        'BASE_COMMIT_CHANGED'
    };
  }

  if (
    Date.parse(
      token.expiresAt
    ) <= now
  ) {
    return {
      valid: false,
      reason:
        'TOKEN_EXPIRED'
    };
  }

  return {
    valid: true,
    reason:
      'HUMAN_APPROVAL_TOKEN_VALID'
  };
}

function consume(token) {
  if (token.used === true) {
    throw new Error(
      'APPROVAL_TOKEN_REPLAY'
    );
  }

  return {
    ...token,
    used: true,
    usedAt:
      new Date().toISOString()
  };
}

module.exports = {
  hash,
  issue,
  verify,
  consume
};
