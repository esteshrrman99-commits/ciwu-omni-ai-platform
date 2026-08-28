'use strict';

const crypto =
  require('node:crypto');

function enqueue({
  task,
  providerEntry,
  contextHash,
  evidenceHash
}) {
  if (
    providerEntry
      ?.runtimeEligible !==
    true
  ) {
    throw new Error(
      'RUNTIME_ELIGIBLE_PROVIDER_REQUIRED'
    );
  }

  if (!contextHash) {
    throw new Error(
      'CONTEXT_HASH_REQUIRED'
    );
  }

  if (!evidenceHash) {
    throw new Error(
      'EVIDENCE_HASH_REQUIRED'
    );
  }

  return {
    id:
      crypto.randomUUID(),

    state:
      'QUEUED_FOR_SANDBOX_ONLY',

    task,

    provider: {
      provider:
        providerEntry.provider,
      model:
        providerEntry.model
    },

    contextHash,
    evidenceHash,

    productionMutation:
      false,

    gitMutation:
      false,

    createdAt:
      new Date().toISOString()
  };
}

function complete(
  record,
  {
    sandboxCertified,
    regressionPassed,
    repairEvidenceHash
  }
) {
  if (
    sandboxCertified !== true ||
    regressionPassed !== true ||
    !repairEvidenceHash
  ) {
    return {
      certified: false,
      state:
        'QUARANTINED_FAILURE'
    };
  }

  return {
    certified: true,

    record: {
      ...record,

      state:
        'CERTIFIED_PROPOSAL',

      repairEvidenceHash,

      certifiedAt:
        new Date().toISOString()
    }
  };
}

module.exports = {
  enqueue,
  complete
};
