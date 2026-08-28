'use strict';

const crypto =
  require('node:crypto');

function create({
  baseCommit,
  patchHash,
  sandboxEvidenceHash,
  regressionEvidenceHash,
  providerEvidenceHash
}) {
  const required={
    baseCommit,
    patchHash,
    sandboxEvidenceHash,
    regressionEvidenceHash,
    providerEvidenceHash
  };

  for (const [k,v]
    of Object.entries(required)) {
    if (!v)
      throw new Error(
        `${k.toUpperCase()}_REQUIRED`
      );
  }

  return {
    schema:
      'CIWU_CODEX_PROPOSAL_CEREMONY_V4',

    proposalId:
      crypto.randomUUID(),

    ...required,

    humanApproval:false,

    gitPushAuthorized:false,

    productionMutationAuthorized:false,

    createdAt:
      new Date().toISOString()
  };
}

function approve(
  proposal,
  currentBaseCommit
) {
  if (
    proposal.baseCommit !==
    currentBaseCommit
  ) {
    throw new Error(
      'BASE_COMMIT_RACE'
    );
  }

  return {
    ...proposal,
    humanApproval:true,

    gitPushAuthorized:false,
    productionMutationAuthorized:false,

    approvedAt:
      new Date().toISOString()
  };
}

module.exports = {
  create,
  approve
};
