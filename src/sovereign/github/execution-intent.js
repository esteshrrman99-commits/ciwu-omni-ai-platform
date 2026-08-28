'use strict';

const crypto =
  require('node:crypto');

const ALLOWED =
  new Set([
    'BRANCH_CREATE',
    'COMMIT',
    'PUSH',
    'PR_CREATE'
  ]);

function create({
  proposalId,
  operation,
  repository,
  baseCommit
}) {
  if (!proposalId)
    throw new Error(
      'PROPOSAL_REQUIRED'
    );

  if (
    !ALLOWED.has(
      operation
    )
  ) {
    throw new Error(
      'OPERATION_NOT_ALLOWED'
    );
  }

  if (!repository)
    throw new Error(
      'REPOSITORY_REQUIRED'
    );

  if (!baseCommit)
    throw new Error(
      'BASE_COMMIT_REQUIRED'
    );

  return {
    id:
      crypto.randomUUID(),

    proposalId,
    operation,
    repository,
    baseCommit,

    humanApproved:
      false,

    executed:
      false,

    createdAt:
      new Date()
        .toISOString()
  };
}

function approve(
  intent
) {
  return {
    ...intent,

    humanApproved:
      true,

    approvedAt:
      new Date()
        .toISOString()
  };
}

function mayExecute(
  intent
) {
  return (
    intent &&
    intent.humanApproved ===
      true &&
    intent.executed !==
      true &&
    ALLOWED.has(
      intent.operation
    )
  );
}

module.exports = {
  ALLOWED,
  create,
  approve,
  mayExecute
};
