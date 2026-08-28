'use strict';

const crypto =
  require('node:crypto');

function issue({
  proposalId,
  operation,
  ttlMs = 15 * 60 * 1000
}) {
  if (!proposalId)
    throw new Error(
      'PROPOSAL_ID_REQUIRED'
    );

  if (
    ![
      'BRANCH_CREATE',
      'COMMIT',
      'PUSH',
      'PR_CREATE'
    ].includes(
      operation
    )
  ) {
    throw new Error(
      'OPERATION_NOT_ALLOWED'
    );
  }

  const token =
    crypto
      .randomBytes(32)
      .toString('hex');

  return {
    token,
    tokenHash:
      crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),

    proposalId,
    operation,

    issuedAt:
      Date.now(),

    expiresAt:
      Date.now() +
      ttlMs,

    used:
      false
  };
}

function verify({
  approval,
  token,
  proposalId,
  operation,
  now = Date.now()
}) {
  if (!approval)
    return false;

  if (approval.used)
    return false;

  if (
    now >
    approval.expiresAt
  ) return false;

  if (
    approval.proposalId !==
    proposalId
  ) return false;

  if (
    approval.operation !==
    operation
  ) return false;

  const hash =
    crypto
      .createHash('sha256')
      .update(
        String(token)
      )
      .digest('hex');

  return (
    hash ===
    approval.tokenHash
  );
}

module.exports = {
  issue,
  verify
};
