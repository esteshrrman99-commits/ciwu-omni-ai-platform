"use strict";

const {
  classifyReality
} = require("../reality/m3-reality-gate");

const {
  evaluateHCNS
} = require("../hcns/m3-hcns");

const {
  readState,
  writeState,
  checkpoint
} = require("../state/m3-state");

function verifySystem(input = {}) {
  const state = readState();

  const result = {
    ok: true,
    verified: false,
    system: "M3",
    evidenceLevel: state.evidenceLevel,
    realityStatus: state.realityStatus,
    securityStatus: state.securityStatus,
    checkpointStatus: state.checkpointStatus,
    checks: {}
  };

  result.checks.stateReadable = true;

  result.checks.objectivePresent =
    typeof state.objective === "string" &&
    state.objective.trim().length > 0;

  result.checks.securityStatus =
    state.securityStatus === "PASS";

  result.checks.checkpointPresent =
    typeof state.checkpointStatus === "string" &&
    state.checkpointStatus.length > 0;

  result.verified =
    result.checks.stateReadable &&
    result.checks.securityStatus &&
    result.checks.checkpointPresent;

  if (input.objective) {
    const reality = classifyReality({
      objective: input.objective,
      evidenceLevel: input.evidenceLevel,
      simulation: input.simulation,
      prototype: input.prototype,
      experiment: input.experiment,
      reproducible: input.reproducible,
      independentVerification:
        input.independentVerification,
      feasible: input.feasible,
      facts: input.facts,
      assumptions: input.assumptions,
      unknowns: input.unknowns,
      constraints: input.constraints
    });

    result.reality = reality;
  }

  if (input.hope !== undefined ||
      input.care !== undefined ||
      input.need !== undefined ||
      input.shalom !== undefined) {
    result.hcns = evaluateHCNS(input);
  }

  if (result.verified) {
    checkpoint("VERIFIED", {
      testStatus: "PASS",
      verificationResults: result
    });
  }

  return result;
}

module.exports = {
  verifySystem
};
