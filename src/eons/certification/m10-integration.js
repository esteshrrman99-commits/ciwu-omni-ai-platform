"use strict";

/*
 * EONS M10 INTEGRATION ADAPTER
 *
 * Purpose:
 *   Connect the M10 certification engine to the existing EONS
 *   architecture without modifying or bypassing M3 governance,
 *   security, reality, verification, or execution controls.
 *
 * Safety:
 *   - Read-only integration by default.
 *   - No git operations.
 *   - No deployment.
 *   - No publication.
 *   - No external contact.
 *   - No financial actions.
 *   - No destructive operations.
 */

const certification = require(
  "./eons-certification-engine"
);

const {
  STATUS,
  LEVEL,
  MILESTONES,
  MILESTONE_STATES,
  ACTION_POLICY,
  certifyClaim,
  createCertificationRecord,
  canPromote,
  exahashFrontier,
  verifyProductionEvidence,
  adversarialSecurityGate,
  assertNonDestructive
} = certification;

const M10_ID = "M010_CERTIFICATION_INTEGRATION";

const INTEGRATION_STATUS = Object.freeze({
  READY: "READY",
  BLOCKED: "BLOCKED",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  FAILED: "FAILED"
});

function createIntegrationContext(input = {}) {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new TypeError(
      "M10 integration input must be an object"
    );
  }

  return {
    integrationId: M10_ID,

    certificationEngine: {
      loaded: true,
      module: "eons-certification-engine",
      evidenceAuthority: "REPRODUCIBLE_EVIDENCE"
    },

    milestoneArchitecture: {
      count: MILESTONES.length,
      states: [...MILESTONE_STATES],
      milestones: [...MILESTONES]
    },

    actionPolicy: {
      ...ACTION_POLICY
    },

    claim: input.claim || null,

    metadata: {
      createdAt: new Date().toISOString(),
      mode: "NON_DESTRUCTIVE_VERIFICATION"
    }
  };
}

function certify(input = {}) {
  const context = createIntegrationContext(input);

  if (!input.claim) {
    return {
      status: INTEGRATION_STATUS.INSUFFICIENT_EVIDENCE,
      context,
      certification: null,
      reason: "No claim supplied"
    };
  }

  const certificationRecord =
    createCertificationRecord(input.claim);

  return {
    status:
      certificationRecord.STATUS === STATUS.UNKNOWN
        ? INTEGRATION_STATUS.INSUFFICIENT_EVIDENCE
        : INTEGRATION_STATUS.READY,

    context,

    certification: certificationRecord
  };
}

function evaluatePromotion(
  currentStatus,
  targetStatus,
  evidence = {}
) {
  return canPromote(
    currentStatus,
    targetStatus,
    evidence
  );
}

function evaluateProduction(evidence = {}) {
  return verifyProductionEvidence(evidence);
}

function evaluateSecurity(results = {}) {
  return adversarialSecurityGate(results);
}

function evaluateExahash(input = {}) {
  return exahashFrontier(input);
}

function verifyExecutionBoundary() {
  const safeActions = [
    "verification",
    "testing"
  ];

  const protectedActions = [
    "commit",
    "push",
    "deployment",
    "publication",
    "spending",
    "thirdPartyContact",
    "destructiveOperation"
  ];

  for (const action of safeActions) {
    assertNonDestructive(action);
  }

  const blocked = [];

  for (const action of protectedActions) {
    try {
      assertNonDestructive(action);
    } catch (error) {
      blocked.push({
        action,
        blocked: true,
        reason: error.message
      });
    }
  }

  return {
    passed:
      blocked.length === protectedActions.length,

    safeActions,

    protectedActions,

    blocked
  };
}

function getArchitectureStatus() {
  return {
    integrationId: M10_ID,

    engineLoaded: true,

    milestoneCount: MILESTONES.length,

    milestoneStates: MILESTONE_STATES.length,

    highestEvidenceLevel:
      LEVEL.HIGH_CONFIDENCE_ESTABLISHED,

    evidenceAuthority:
      "REPRODUCIBLE_EVIDENCE",

    productionClaimsRequireEvidence: true,

    physicalEvidenceRequired: true,

    protectedActionsRequireExplicitAuthorization: true,

    status: INTEGRATION_STATUS.READY
  };
}

module.exports = {
  M10_ID,
  INTEGRATION_STATUS,
  STATUS,
  LEVEL,
  createIntegrationContext,
  certify,
  evaluatePromotion,
  evaluateProduction,
  evaluateSecurity,
  evaluateExahash,
  verifyExecutionBoundary,
  getArchitectureStatus
};
