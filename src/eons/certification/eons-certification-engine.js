"use strict";

/*
 * EONS / ZORTEX / CORTEX / CODEX / VORTEX / NEUROTEX
 * M10 — RESEARCH-GRADE PRODUCTION & REALITY VERIFICATION ENGINE
 *
 * Purpose:
 *   Enforce evidence boundaries.
 *
 * This module DOES NOT prove scientific claims by itself.
 * It classifies evidence, blocks unsupported promotion,
 * records provenance, and requires appropriate verification gates.
 */

const STATUS = Object.freeze({
  UNKNOWN: "UNKNOWN",
  HYPOTHESIS: "HYPOTHESIS",
  THEORETICALLY_SUPPORTED: "THEORETICALLY_SUPPORTED",
  SIMULATED: "SIMULATED",
  COMPUTATIONALLY_REPRODUCED: "COMPUTATIONALLY_REPRODUCED",
  EXPERIMENTALLY_DEMONSTRATED: "EXPERIMENTALLY_DEMONSTRATED",
  INDEPENDENTLY_REPRODUCED: "INDEPENDENTLY_REPRODUCED",
  PRODUCTION_VALIDATED: "PRODUCTION_VALIDATED",
  INDEPENDENTLY_AUDITED: "INDEPENDENTLY_AUDITED",
  HIGH_CONFIDENCE_ESTABLISHED: "HIGH_CONFIDENCE_ESTABLISHED",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  REFUTED: "REFUTED",
  PHYSICS_CONFLICT: "PHYSICS_CONFLICT",
  SECURITY_FAILURE: "SECURITY_FAILURE",
  REPRODUCTION_FAILURE: "REPRODUCTION_FAILURE"
});

const LEVEL = Object.freeze({
  UNKNOWN: 0,
  HYPOTHESIS: 1,
  MATHEMATICAL: 2,
  SIMULATED: 3,
  SOFTWARE_REPRODUCED: 4,
  LABORATORY_DEMONSTRATION: 5,
  INDEPENDENT_REPLICATION: 6,
  PROTOTYPE_VALIDATION: 7,
  PRODUCTION_VALIDATION: 8,
  INDEPENDENT_PRODUCTION_AUDIT: 9,
  HIGH_CONFIDENCE_ESTABLISHED: 10
});

const MILESTONES = Object.freeze([
  "M001_REPOSITORY_INTEGRITY",
  "M002_EXISTING_MILESTONE_PRESERVATION",
  "M003_GOVERNANCE_VERIFICATION",
  "M004_SECURITY_VERIFICATION",
  "M005_REALITY_CLASSIFICATION",
  "M006_MATHEMATICAL_VERIFICATION",
  "M007_COMPUTATIONAL_REPRODUCTION",
  "M008_EXPERIMENTAL_VERIFICATION",
  "M009_INDEPENDENT_REPRODUCTION",
  "M010_PRODUCTION_VERIFICATION",
  "M011_ADVERSARIAL_SECURITY_VERIFICATION",
  "M012_PHYSICAL_REALITY_VERIFICATION",
  "M013_ECONOMIC_VERIFICATION",
  "M014_CLAIM_CERTIFICATION",
  "M015_CONTINUOUS_INTEGRITY_MONITORING"
]);

const MILESTONE_STATES = Object.freeze([
  "PENDING",
  "RUNNING",
  "PASSED",
  "FAILED",
  "BLOCKED",
  "INCONCLUSIVE",
  "SUPERSEDED"
]);

const PROHIBITED_CERTIFICATIONS = new Set([
  "GUARANTEED",
  "IMPOSSIBLE_TO_FAIL",
  "IRREFUTABLE",
  "MAGIC",
  "INFINITE",
  "UNLIMITED",
  "CERTAIN"
]);

const CLAIM_FIELDS = Object.freeze([
  "CLAIM_ID",
  "CLAIM",
  "STATUS",
  "EVIDENCE_LEVEL",
  "MATHEMATICAL_STATUS",
  "SOFTWARE_STATUS",
  "EXPERIMENTAL_STATUS",
  "INDEPENDENT_REPLICATION_STATUS",
  "PHYSICAL_STATUS",
  "PRODUCTION_STATUS",
  "SECURITY_STATUS",
  "ECONOMIC_STATUS",
  "CONFIDENCE",
  "UNCERTAINTY",
  "CONTRADICTORY_EVIDENCE",
  "FALSIFICATION_TEST",
  "REMAINING_BLOCKERS",
  "CERTIFICATION_DATE"
]);

const PROMOTION_ORDER = Object.freeze([
  STATUS.UNKNOWN,
  STATUS.HYPOTHESIS,
  STATUS.THEORETICALLY_SUPPORTED,
  STATUS.SIMULATED,
  STATUS.COMPUTATIONALLY_REPRODUCED,
  STATUS.EXPERIMENTALLY_DEMONSTRATED,
  STATUS.INDEPENDENTLY_REPRODUCED,
  STATUS.PRODUCTION_VALIDATED,
  STATUS.INDEPENDENTLY_AUDITED,
  STATUS.HIGH_CONFIDENCE_ESTABLISHED
]);

const REQUIRED_EVIDENCE = Object.freeze({
  [STATUS.THEORETICALLY_SUPPORTED]: [
    "mathematicalDerivation"
  ],

  [STATUS.SIMULATED]: [
    "mathematicalDerivation",
    "simulation"
  ],

  [STATUS.COMPUTATIONALLY_REPRODUCED]: [
    "mathematicalDerivation",
    "softwareImplementation",
    "benchmark"
  ],

  [STATUS.EXPERIMENTALLY_DEMONSTRATED]: [
    "experiment",
    "measurements",
    "methodology"
  ],

  [STATUS.INDEPENDENTLY_REPRODUCED]: [
    "experiment",
    "independentReplication"
  ],

  [STATUS.PRODUCTION_VALIDATED]: [
    "experiment",
    "independentReplication",
    "productionEvidence"
  ],

  [STATUS.INDEPENDENTLY_AUDITED]: [
    "productionEvidence",
    "independentAudit"
  ],

  [STATUS.HIGH_CONFIDENCE_ESTABLISHED]: [
    "mathematicalDerivation",
    "experiment",
    "independentReplication",
    "productionEvidence",
    "independentAudit"
  ]
});

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function hasEvidence(evidence, field) {
  const value = evidence && evidence[field];

  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function normalizeEvidence(evidence = {}) {
  if (!isObject(evidence)) {
    throw new TypeError("Evidence must be an object");
  }

  return { ...evidence };
}

function statusLevel(status) {
  const map = {
    [STATUS.UNKNOWN]: LEVEL.UNKNOWN,
    [STATUS.HYPOTHESIS]: LEVEL.HYPOTHESIS,
    [STATUS.THEORETICALLY_SUPPORTED]: LEVEL.MATHEMATICAL,
    [STATUS.SIMULATED]: LEVEL.SIMULATED,
    [STATUS.COMPUTATIONALLY_REPRODUCED]:
      LEVEL.SOFTWARE_REPRODUCED,
    [STATUS.EXPERIMENTALLY_DEMONSTRATED]:
      LEVEL.LABORATORY_DEMONSTRATION,
    [STATUS.INDEPENDENTLY_REPRODUCED]:
      LEVEL.INDEPENDENT_REPLICATION,
    [STATUS.PRODUCTION_VALIDATED]:
      LEVEL.PRODUCTION_VALIDATION,
    [STATUS.INDEPENDENTLY_AUDITED]:
      LEVEL.INDEPENDENT_PRODUCTION_AUDIT,
    [STATUS.HIGH_CONFIDENCE_ESTABLISHED]:
      LEVEL.HIGH_CONFIDENCE_ESTABLISHED
  };

  return map[status] ?? LEVEL.UNKNOWN;
}

function requiredEvidenceFor(status) {
  return REQUIRED_EVIDENCE[status] || [];
}

function missingEvidence(status, evidence) {
  return requiredEvidenceFor(status)
    .filter(field => !hasEvidence(evidence, field));
}

function canPromote(currentStatus, targetStatus, evidence = {}) {
  const currentLevel = statusLevel(currentStatus);
  const targetLevel = statusLevel(targetStatus);

  if (PROHIBITED_CERTIFICATIONS.has(targetStatus)) {
    return {
      allowed: false,
      status: STATUS.SECURITY_FAILURE,
      reason: "Prohibited certification vocabulary"
    };
  }

  if (targetLevel < currentLevel) {
    return {
      allowed: false,
      status: "BLOCKED",
      reason: "Backward promotion is not permitted"
    };
  }

  if (targetLevel > currentLevel + 1) {
    return {
      allowed: false,
      status: "BLOCKED",
      reason: "Evidence levels may not be skipped"
    };
  }

  const missing = missingEvidence(targetStatus, evidence);

  if (missing.length > 0) {
    return {
      allowed: false,
      status: STATUS.INSUFFICIENT_EVIDENCE,
      missing
    };
  }

  return {
    allowed: true,
    status: targetStatus,
    missing: []
  };
}

function classifyClaim(claim) {
  if (!isObject(claim)) {
    throw new TypeError("Claim must be an object");
  }

  const evidence = normalizeEvidence(claim.evidence);

  if (claim.refuted === true) {
    return STATUS.REFUTED;
  }

  if (claim.physicsConflict === true) {
    return STATUS.PHYSICS_CONFLICT;
  }

  if (claim.securityFailure === true) {
    return STATUS.SECURITY_FAILURE;
  }

  if (claim.reproductionFailure === true) {
    return STATUS.REPRODUCTION_FAILURE;
  }

  const ordered = [
    STATUS.HIGH_CONFIDENCE_ESTABLISHED,
    STATUS.INDEPENDENTLY_AUDITED,
    STATUS.PRODUCTION_VALIDATED,
    STATUS.INDEPENDENTLY_REPRODUCED,
    STATUS.EXPERIMENTALLY_DEMONSTRATED,
    STATUS.COMPUTATIONALLY_REPRODUCED,
    STATUS.SIMULATED,
    STATUS.THEORETICALLY_SUPPORTED
  ];

  for (const status of ordered) {
    if (missingEvidence(status, evidence).length === 0) {
      return status;
    }
  }

  if (hasEvidence(evidence, "hypothesis")) {
    return STATUS.HYPOTHESIS;
  }

  return STATUS.UNKNOWN;
}

function certifyClaim(claim) {
  if (!isObject(claim)) {
    throw new TypeError("Claim must be an object");
  }

  const evidence = normalizeEvidence(claim.evidence);
  const status = classifyClaim({
    ...claim,
    evidence
  });

  return {
    CLAIM_ID: claim.CLAIM_ID || null,
    CLAIM: claim.CLAIM || null,
    STATUS: status,
    EVIDENCE_LEVEL: statusLevel(status),

    MATHEMATICAL_STATUS:
      hasEvidence(evidence, "mathematicalDerivation")
        ? "PRESENT"
        : "MISSING",

    SOFTWARE_STATUS:
      hasEvidence(evidence, "softwareImplementation")
        ? "PRESENT"
        : "MISSING",

    EXPERIMENTAL_STATUS:
      hasEvidence(evidence, "experiment")
        ? "PRESENT"
        : "MISSING",

    INDEPENDENT_REPLICATION_STATUS:
      hasEvidence(evidence, "independentReplication")
        ? "PRESENT"
        : "MISSING",

    PHYSICAL_STATUS:
      hasEvidence(evidence, "physicalValidation")
        ? "PRESENT"
        : "MISSING",

    PRODUCTION_STATUS:
      hasEvidence(evidence, "productionEvidence")
        ? "PRESENT"
        : "MISSING",

    SECURITY_STATUS:
      hasEvidence(evidence, "securityVerification")
        ? "PRESENT"
        : "MISSING",

    ECONOMIC_STATUS:
      hasEvidence(evidence, "economicVerification")
        ? "PRESENT"
        : "MISSING",

    CONFIDENCE:
      claim.confidence ?? "UNASSESSED",

    UNCERTAINTY:
      claim.uncertainty ?? "UNASSESSED",

    CONTRADICTORY_EVIDENCE:
      claim.contradictoryEvidence ?? [],

    FALSIFICATION_TEST:
      claim.falsificationTest ?? null,

    REMAINING_BLOCKERS:
      missingEvidence(status, evidence),

    CERTIFICATION_DATE:
      new Date().toISOString()
  };
}

/*
 * EXAHASH FRONTIER
 *
 * These are calculations, not proof of physical deployment.
 */
function exahashFrontier(input = {}) {
  const {
    hashrate = 0,
    hashrateUnit = "H/s",
    joulesPerHash = null,
    watts = null,
    uptime = 1,
    hardwareCount = null,
    hardwareHashrate = null,
    hardwarePower = null
  } = input;

  const multipliers = {
    "H/s": 1,
    "KH/s": 1e3,
    "MH/s": 1e6,
    "GH/s": 1e9,
    "TH/s": 1e12,
    "PH/s": 1e15,
    "EH/s": 1e18
  };

  if (!(hashrateUnit in multipliers)) {
    throw new Error("Unsupported hashrate unit");
  }

  const H = Number(hashrate) * multipliers[hashrateUnit];

  if (!Number.isFinite(H) || H < 0) {
    throw new Error("Invalid hashrate");
  }

  const result = {
    hashrate_Hps: H,
    THps: H / 1e12,
    PHps: H / 1e15,
    EHps: H / 1e18,
    hashesPerYear:
      H * 365.25 * 24 * 3600 * Number(uptime),
    uptime: Number(uptime),
    powerWatts: null,
    powerMW: null,
    joulesPerHash:
      joulesPerHash === null ? null : Number(joulesPerHash),
    physicalEvidenceRequired: true,
    productionClaimAllowed: false
  };

  if (watts !== null) {
    result.powerWatts = Number(watts);
  } else if (joulesPerHash !== null) {
    result.powerWatts =
      H * Number(joulesPerHash);
  }

  if (result.powerWatts !== null) {
    result.powerMW =
      result.powerWatts / 1e6;
  }

  if (
    hardwareCount !== null &&
    hardwareHashrate !== null
  ) {
    result.minimumHardwareCount =
      Math.ceil(
        H / Number(hardwareHashrate)
      );
  }

  if (
    hardwareCount !== null &&
    hardwarePower !== null
  ) {
    result.hardwarePowerWatts =
      Number(hardwareCount) *
      Number(hardwarePower);
  }

  return result;
}

function verifyProductionEvidence(evidence = {}) {
  const required = [
    "continuousRuntime",
    "independentThroughputMeasurement",
    "independentEnergyMeasurement",
    "uptime",
    "failureRate",
    "environmentalConditions",
    "workloadConditions",
    "telemetry",
    "methodology"
  ];

  const missing = required.filter(
    key => !hasEvidence(evidence, key)
  );

  return {
    passed: missing.length === 0,
    missing,
    status:
      missing.length === 0
        ? STATUS.PRODUCTION_VALIDATED
        : STATUS.INSUFFICIENT_EVIDENCE
  };
}

function adversarialSecurityGate(results = {}) {
  const attacks = [
    "malformedInputs",
    "privilegeEscalation",
    "unauthorizedExecution",
    "commandInjection",
    "codeInjection",
    "dependencyCompromise",
    "supplyChain",
    "secretLeakage",
    "pathTraversal",
    "raceConditions",
    "stateCorruption",
    "replayAttacks",
    "forgedTelemetry",
    "benchmarkManipulation",
    "fabricatedEvidence",
    "timestampManipulation",
    "logManipulation",
    "measurementCompromise",
    "maliciousPlugins",
    "externalSourceCompromise",
    "promptInjection",
    "dataPoisoning",
    "resultManipulation"
  ];

  const failures = attacks.filter(
    attack => results[attack] !== true
  );

  return {
    passed: failures.length === 0,
    tested: attacks,
    failures,
    status:
      failures.length === 0
        ? "PASSED"
        : STATUS.SECURITY_FAILURE
  };
}

const ACTION_POLICY = Object.freeze({
  verification: "ALLOW_NON_DESTRUCTIVE",
  testing: "ALLOW_NON_DESTRUCTIVE",
  commit: "EXPLICIT_AUTHORIZATION_REQUIRED",
  push: "EXPLICIT_AUTHORIZATION_REQUIRED",
  deployment: "EXPLICIT_AUTHORIZATION_REQUIRED",
  publication: "EXPLICIT_AUTHORIZATION_REQUIRED",
  spending: "EXPLICIT_AUTHORIZATION_REQUIRED",
  thirdPartyContact: "EXPLICIT_AUTHORIZATION_REQUIRED",
  destructiveOperation: "EXPLICIT_AUTHORIZATION_REQUIRED"
});

function assertNonDestructive(action) {
  const protectedActions = [
    "commit",
    "push",
    "deployment",
    "publication",
    "spending",
    "thirdPartyContact",
    "destructiveOperation"
  ];

  if (protectedActions.includes(action)) {
    throw new Error(
      `EXPLICIT_AUTHORIZATION_REQUIRED: ${action}`
    );
  }

  return true;
}

function createCertificationRecord(claim) {
  return {
    ...certifyClaim(claim),
    PRIME_LAW:
      "THE SYSTEM MAY DISCOVER A BREAKTHROUGH. " +
      "THE SYSTEM MAY NOT INVENT A BREAKTHROUGH.",
    EVIDENCE_AUTHORITY:
      "REPRODUCIBLE_EVIDENCE"
  };
}

module.exports = {
  STATUS,
  LEVEL,
  MILESTONES,
  MILESTONE_STATES,
  CLAIM_FIELDS,
  PROMOTION_ORDER,
  ACTION_POLICY,
  exahashFrontier,
  classifyClaim,
  certifyClaim,
  createCertificationRecord,
  canPromote,
  verifyProductionEvidence,
  adversarialSecurityGate,
  assertNonDestructive,
  statusLevel,
  requiredEvidenceFor
};
