"use strict";

/*
 * M3 / EONS GOVERNANCE ARCHITECTURE
 *
 * These names define architectural/governance domains.
 * They are NOT security bypass mechanisms.
 *
 * Concrete security enforcement remains in:
 *   - m3-policy.js
 *   - m3-agent.js
 *   - workspace containment
 *   - executable allowlisting
 *   - timeout/output limits
 *   - explicit authorization
 */

const GOVERNANCE_STACK = Object.freeze([
  "sortex",
  "vortex",
  "zortex",
  "nerutex",
  "cortex",
  "codex",
  "rortex",
  "eurtex",
  "bortex",
  "axrtex",
  "porotex",
  "lortex",
  "irotex",
  "celltex",
  "hertex",
  "xortex",
  "yahtex",
  "aglatex",
  "galaxyah",
  "eltex",
  "yahwehtex",
  "eontex",
  "matrix_autonomous_mind"
]);

const GOVERNANCE_DOMAINS = Object.freeze({
  sortex: "system sorting and prioritization",
  vortex: "controlled execution orchestration",
  zortex: "code intelligence and transformation",
  nerutex: "project memory and contextual continuity",
  cortex: "planning, reasoning, and decision analysis",
  codex: "code knowledge and implementation",
  rortex: "recursive review and refinement",
  eurtex: "evaluation and uncertainty analysis",
  bortex: "boundary observation and risk detection",
  axrtex: "action authorization and routing",
  porotex: "protocol orchestration",
  lortex: "logic verification",
  irotex: "input/output reasoning",
  celltex: "modular component isolation",
  hertex: "health and integrity monitoring",
  xortex: "exception and anomaly handling",
  yahtex: "governance identity layer",
  aglatex: "aggregate intelligence layer",
  galaxyah: "system-wide coordination layer",
  eltex: "execution lifecycle management",
  yahwehtex: "highest-level governance naming domain",
  eontex: "long-horizon system evolution",
  matrix_autonomous_mind: "overall autonomous architecture coordination"
});

const SECURITY_ENFORCEMENT = Object.freeze({
  workspaceContainment: true,
  executableAllowlist: true,
  commandValidation: true,
  destructiveOperationBlocking: true,
  timeoutEnforcement: true,
  outputLimit: true,
  secretProtection: true,
  authorizationBoundary: true,
  auditability: true,
  failClosed: true
});

function getGovernanceStack() {
  return GOVERNANCE_STACK.map(name => ({
    name,
    domain: GOVERNANCE_DOMAINS[name]
  }));
}

function getSecurityBoundary() {
  return { ...SECURITY_ENFORCEMENT };
}

module.exports = {
  GOVERNANCE_STACK,
  GOVERNANCE_DOMAINS,
  SECURITY_ENFORCEMENT,
  getGovernanceStack,
  getSecurityBoundary
};
