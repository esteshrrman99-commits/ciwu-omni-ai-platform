"use strict";

const ELITE_POLICY = Object.freeze({
  forcePush: false,
  destructiveFilesystemOperations: false,
  secretPrinting: false,
  unrestrictedShell: false,
  unrestrictedNetwork: false,
  unrestrictedFilesystemMutation: false,
  automaticCredentialAccess: false,
  automaticAuthorizationEscalation: false,
  automaticProductionModification: false,
  executionDefault: false,
  requireVerificationBeforeCompletion: true,
  requireLearningRecord: true,
  requireCheckpoint: true
});

function validatePolicy() {
  for (const [key, value] of Object.entries(ELITE_POLICY)) {
    if (
      [
        "forcePush",
        "destructiveFilesystemOperations",
        "secretPrinting",
        "unrestrictedShell",
        "unrestrictedNetwork",
        "unrestrictedFilesystemMutation",
        "automaticCredentialAccess",
        "automaticAuthorizationEscalation",
        "automaticProductionModification",
        "executionDefault"
      ].includes(key) &&
      value !== false
    ) {
      throw new Error(`Elite security invariant failed: ${key}`);
    }
  }

  return true;
}

module.exports = {
  ELITE_POLICY,
  validatePolicy
};
