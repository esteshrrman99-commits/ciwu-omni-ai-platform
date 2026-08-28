'use strict';

const crypto =
  require('node:crypto');

function create({
  task,
  contextHash,
  provider,
  model,
  providerEvidenceHash
}) {
  if (!contextHash) {
    throw new Error(
      'CONTEXT_HASH_REQUIRED'
    );
  }

  if (!providerEvidenceHash) {
    throw new Error(
      'PROVIDER_EVIDENCE_REQUIRED'
    );
  }

  return {
    schema:
      'CIWU_CODEX_REPAIR_CAMPAIGN_V2',

    campaignId:
      crypto.randomUUID(),

    state:
      'PLANNED_SANDBOX_ONLY',

    task,
    contextHash,
    provider,
    model,
    providerEvidenceHash,

    productionMutation:
      false,

    gitMutation:
      false,

    createdAt:
      new Date().toISOString()
  };
}

function certify({
  campaign,
  patchHash,
  sandboxHash,
  testHash,
  syntaxPassed,
  regressionPassed
}) {
  if (
    syntaxPassed !== true
  ) {
    return {
      certified: false,
      reason:
        'SYNTAX_FAILED'
    };
  }

  if (
    regressionPassed !== true
  ) {
    return {
      certified: false,
      reason:
        'REGRESSION_FAILED'
    };
  }

  if (
    !patchHash ||
    !sandboxHash ||
    !testHash
  ) {
    return {
      certified: false,
      reason:
        'REPAIR_EVIDENCE_INCOMPLETE'
    };
  }

  return {
    certified: true,

    record: {
      ...campaign,

      state:
        'CERTIFIED_PROPOSAL',

      patchHash,
      sandboxHash,
      testHash,

      certifiedAt:
        new Date().toISOString()
    }
  };
}

module.exports = {
  create,
  certify
};
