'use strict';

const crypto = require('node:crypto');

function create({
  repository,
  baseBranch,
  baseCommit,
  proposalId,
  changedFiles,
  title
}) {
  if (!repository)
    throw new Error(
      'REPOSITORY_REQUIRED'
    );

  if (!baseBranch)
    throw new Error(
      'BASE_BRANCH_REQUIRED'
    );

  if (!baseCommit)
    throw new Error(
      'BASE_COMMIT_REQUIRED'
    );

  if (!proposalId)
    throw new Error(
      'PROPOSAL_REQUIRED'
    );

  if (
    !Array.isArray(
      changedFiles
    ) ||
    changedFiles.length === 0
  ) {
    throw new Error(
      'CHANGED_FILES_REQUIRED'
    );
  }

  return {
    schema:
      'CIWU_GITHUB_PR_PLAN_V1',

    id:
      crypto.randomUUID(),

    repository,
    baseBranch,
    baseCommit,
    proposalId,
    changedFiles:
      [...changedFiles].sort(),

    title:
      title || 'CIWU proposal',

    dryRun:
      true,

    humanApprovalRequired:
      true,

    branchCreated:
      false,

    commitCreated:
      false,

    pushed:
      false,

    pullRequestCreated:
      false,

    forcePush:
      false
  };
}

module.exports = {
  create
};
