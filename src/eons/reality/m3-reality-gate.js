"use strict";

const EVIDENCE_LEVELS = Object.freeze({
  IMAGINATION: 0,
  ASSERTION: 1,
  REASONING: 2,
  SIMULATION: 3,
  PROTOTYPE: 4,
  EXPERIMENT: 5,
  REPRODUCIBLE_EXPERIMENT: 6,
  INDEPENDENT_VERIFICATION: 7
});

const REALITY_STATUS = Object.freeze([
  "UNKNOWN",
  "THEORETICAL",
  "SIMULATED",
  "FEASIBLE",
  "PROTOTYPED",
  "EXPERIMENTAL",
  "REPRODUCIBLE",
  "INDEPENDENTLY_VERIFIED"
]);

function normalizeEvidenceLevel(value) {
  if (typeof value === "number") {
    if (value >= 0 && value <= 7) return value;
    return 0;
  }

  if (typeof value === "string") {
    const key = value.toUpperCase();

    if (Object.prototype.hasOwnProperty.call(EVIDENCE_LEVELS, key)) {
      return EVIDENCE_LEVELS[key];
    }

    if (key === "UNKNOWN") return 0;
    if (key === "THEORETICAL") return 2;
    if (key === "SIMULATED") return 3;
    if (key === "FEASIBLE") return 3;
    if (key === "PROTOTYPED") return 4;
    if (key === "EXPERIMENTAL") return 5;
    if (key === "REPRODUCIBLE") return 6;
    if (key === "INDEPENDENTLY_VERIFIED") return 7;
  }

  return 0;
}

function classifyReality(input = {}) {
  const objective = String(input.objective || "").trim();

  if (!objective) {
    return {
      status: "UNKNOWN",
      evidenceLevel: 0,
      evidenceLabel: "IMAGINATION",
      confidence: "INSUFFICIENT_DATA",
      facts: [],
      assumptions: [],
      unknowns: ["objective"],
      constraints: [],
      requiredExperiments: [],
      requiredResources: [],
      evidenceGaps: ["A concrete objective is required."],
      falsificationConditions: [],
      verificationRequirements: [
        "Provide a concrete objective.",
        "Identify observable evidence."
      ]
    };
  }

  const evidenceLevel = normalizeEvidenceLevel(input.evidenceLevel);

  let status = "UNKNOWN";

  if (input.independentVerification === true && evidenceLevel >= 7) {
    status = "INDEPENDENTLY_VERIFIED";
  } else if (input.reproducible === true && evidenceLevel >= 6) {
    status = "REPRODUCIBLE";
  } else if (input.experiment === true && evidenceLevel >= 5) {
    status = "EXPERIMENTAL";
  } else if (input.prototype === true && evidenceLevel >= 4) {
    status = "PROTOTYPED";
  } else if (input.simulation === true && evidenceLevel >= 3) {
    status = "SIMULATED";
  } else if (input.feasible === true) {
    status = "FEASIBLE";
  } else if (evidenceLevel >= 2) {
    status = "THEORETICAL";
  }

  const facts = Array.isArray(input.facts) ? input.facts : [];
  const assumptions = Array.isArray(input.assumptions)
    ? input.assumptions
    : [];
  const unknowns = Array.isArray(input.unknowns)
    ? input.unknowns
    : [];

  return {
    status,
    evidenceLevel,
    evidenceLabel:
      Object.keys(EVIDENCE_LEVELS)
        .find(k => EVIDENCE_LEVELS[k] === evidenceLevel) ||
      "IMAGINATION",
    confidence: evidenceLevel >= 5 ? "EVIDENCE_SUPPORTED" : "NOT_VERIFIED",
    objective,
    facts,
    assumptions,
    unknowns,
    constraints: Array.isArray(input.constraints)
      ? input.constraints
      : [],
    requiredExperiments: Array.isArray(input.requiredExperiments)
      ? input.requiredExperiments
      : [],
    requiredResources: Array.isArray(input.requiredResources)
      ? input.requiredResources
      : [],
    evidenceGaps: Array.isArray(input.evidenceGaps)
      ? input.evidenceGaps
      : ["Additional evidence may be required."],
    falsificationConditions: Array.isArray(input.falsificationConditions)
      ? input.falsificationConditions
      : [],
    verificationRequirements:
      Array.isArray(input.verificationRequirements)
        ? input.verificationRequirements
        : [
            "Define measurable success criteria.",
            "Identify reproducible evidence.",
            "Independently verify where applicable."
          ]
  };
}

module.exports = {
  EVIDENCE_LEVELS,
  REALITY_STATUS,
  classifyReality,
  normalizeEvidenceLevel
};
