"use strict";

const express = require("express");
const M3Planner = require("../eons/planning/m3-planner");

const {
  getGovernanceStack,
  getSecurityBoundary
} = require("../eons/governance/m3-governance");

const router = express.Router();
const planner = new M3Planner();

/*
 * Read-only governance inspection.
 *
 * This endpoint exposes architecture metadata only.
 * It does NOT execute commands.
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


router.post("/plan", (req, res) => {
  try {
    const request = req.body && req.body.request;

    if (!request || typeof request !== "string") {
      return res.status(400).json({
        ok: false,
        error: "M3 requires a string request."
      });
    }

    const plan = planner.createPlan(request);

    return res.json({
      ok: true,
      ...plan
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

module.exports = router;
