"use strict";

const express = require("express");

const M3Planner = require("../eons/planning/m3-planner");

const {
  getGovernanceStack,
  getSecurityBoundary
} = require("../eons/governance/m3-governance");

const {
  classifyReality
} = require("../eons/reality/m3-reality-gate");

const {
  evaluateHCNS
} = require("../eons/hcns/m3-hcns");

const {
  readState,
  writeState,
  checkpoint
} = require("../eons/state/m3-state");

const {
  verifySystem
} = require("../eons/verification/m3-verification");

const router = express.Router();
const planner = new M3Planner();

function body(req) {
  return req.body && typeof req.body === "object"
    ? req.body
    : {};
}

function requireString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(`M3 requires a non-empty ${name}.`);
    error.statusCode = 400;
    throw error;
  }

  return value.trim();
}

/*
 * GOVERNANCE
 *
 * Read-only architecture metadata.
 * Execution remains disabled.
 */
router.get("/governance", (_req, res) => {
  res.json({
    ok: true,
    system: "M3",
    mode: "governance-inspection",
    execution: "disabled",
    governance: getGovernanceStack(),
    security: getSecurityBoundary()
  });
});

/*
 * STATE
 *
 * Read-only persistent M3 state.
 */
router.get("/state", (_req, res) => {
  try {
    return res.json({
      ok: true,
      system: "M3",
      execution: "disabled",
      state: readState()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "M3 state unavailable."
    });
  }
});

/*
 * INTAKE
 *
 * Records an objective.
 * Does NOT authorize execution.
 */
router.post("/intake", (req, res) => {
  try {
    const input = body(req);
    const objective = requireString(input.objective, "objective");

    const state = checkpoint("INTAKE", {
      status: "READY",
      objective,
      authorizationLevel: "REQUIRED",
      securityStatus: "PASS",
      testStatus: "NOT_STARTED",
      failureStatus: null
    });

    return res.json({
      ok: true,
      system: "M3",
      execution: "disabled",
      stage: "INTAKE",
      state
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message
    });
  }
});

/*
 * REALITY
 *
 * Classifies evidence without claiming unsupported proof.
 */
router.post("/reality", (req, res) => {
  try {
    const input = body(req);
    const objective = requireString(input.objective, "objective");

    const reality = classifyReality(input);

    const state = checkpoint("REALITY", {
      objective,
      evidenceLevel: reality.evidenceLevel,
      evidenceLabel: reality.evidenceLabel,
      realityStatus: reality.status,
      securityStatus: "PASS"
    });

    return res.json({
      ok: true,
      system: "M3",
      execution: "disabled",
      reality,
      state
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message
    });
  }
});

/*
 * HCNS
 *
 * Governance context only.
 */
router.post("/hcns", (req, res) => {
  try {
    const input = body(req);
    const result = evaluateHCNS(input);

    const state = checkpoint("HCNS", {
      hope: result.hope,
      care: result.care,
      need: result.need,
      shalom: result.shalom,
      securityStatus: "PASS"
    });

    return res.json({
      ok: true,
      system: "M3",
      execution: "disabled",
      hcns: result,
      state
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message
    });
  }
});

/*
 * PLAN
 *
 * Planning only.
 * No shell, filesystem, network, or secret execution.
 */
router.post("/plan", (req, res) => {
  try {
    const input = body(req);
    const request = requireString(input.request, "request");

    const plan = planner.createPlan(request);

    const state = checkpoint("PLAN", {
      status: "WAITING",
      securityStatus: "PASS"
    });

    return res.json({
      ok: true,
      system: "M3",
      execution: "disabled",
      ...plan,
      state
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message
    });
  }
});

/*
 * VERIFY
 *
 * Reports verification state.
 * It does not enable execution.
 */
router.post("/verify", (req, res) => {
  try {
    const input = body(req);
    const result = verifySystem(input);

    return res.json({
      ...result,
      execution: "disabled"
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      ok: false,
      verified: false,
      execution: "disabled",
      error: error.message
    });
  }
});

module.exports = router;
