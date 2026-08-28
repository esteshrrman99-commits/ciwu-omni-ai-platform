'use strict';

const MAX_TOKEN_TTL_SECONDS=900;
const MIN_SECRET_BYTES=32;

const ALLOWED_SCOPE=
  'CIWU_REVIEW_WORKSPACE_APPLY_V1';

function assertSecret(secret) {
  const value=
    Buffer.isBuffer(secret)
      ? secret
      : Buffer.from(
          String(secret || ''),
          'utf8'
        );

  if (
    value.length <
      MIN_SECRET_BYTES
  ) {
    throw new Error(
      'APPROVAL_SECRET_TOO_SHORT'
    );
  }

  return value;
}

function assertClaims(claims) {
  if (
    !claims ||
    typeof claims !== 'object'
  ) {
    throw new Error(
      'APPROVAL_CLAIMS_REQUIRED'
    );
  }

  if (
    claims.scope !==
      ALLOWED_SCOPE
  ) {
    throw new Error(
      'APPROVAL_SCOPE_DENIED'
    );
  }

  if (
    !/^[0-9a-f]{64}$/.test(
      String(
        claims.proposalId || ''
      )
    )
  ) {
    throw new Error(
      'APPROVAL_PROPOSAL_ID_INVALID'
    );
  }

  if (
    !/^[0-9a-f]{64}$/.test(
      String(
        claims.evidenceHash || ''
      )
    )
  ) {
    throw new Error(
      'APPROVAL_EVIDENCE_HASH_INVALID'
    );
  }

  if (
    !/^[0-9a-f]{40}$/.test(
      String(
        claims.baseSha || ''
      )
    )
  ) {
    throw new Error(
      'APPROVAL_BASE_SHA_INVALID'
    );
  }

  if (
    typeof claims.jti !== 'string' ||
    claims.jti.length < 16 ||
    claims.jti.length > 128
  ) {
    throw new Error(
      'APPROVAL_JTI_INVALID'
    );
  }

  if (
    !Number.isInteger(
      claims.iat
    ) ||
    !Number.isInteger(
      claims.exp
    ) ||
    claims.exp <= claims.iat ||
    claims.exp - claims.iat >
      MAX_TOKEN_TTL_SECONDS
  ) {
    throw new Error(
      'APPROVAL_TIME_WINDOW_INVALID'
    );
  }

  return claims;
}

module.exports={
  MAX_TOKEN_TTL_SECONDS,
  MIN_SECRET_BYTES,
  ALLOWED_SCOPE,
  assertSecret,
  assertClaims
};
