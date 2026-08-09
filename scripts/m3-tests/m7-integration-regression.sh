#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "M7 integration regression"

node --check src/routes/m3-governance.js
node --check src/eons/reality/m3-reality-gate.js
node --check src/eons/hcns/m3-hcns.js
node --check src/eons/state/m3-state.js
node --check src/eons/verification/m3-verification.js

node <<'NODE'
const g = require("./src/eons/governance/m3-governance");

if (g.GOVERNANCE_STACK.length !== 23)
  throw new Error("Governance regression");

if (Object.keys(g.SECURITY_ENFORCEMENT).length !== 10)
  throw new Error("Security regression");

for (const value of Object.values(g.SECURITY_ENFORCEMENT)) {
  if (value !== true)
    throw new Error("Security invariant regression");
}

const reality =
  require("./src/eons/reality/m3-reality-gate");

const r = reality.classifyReality({
  objective: "negative test",
  evidenceLevel: 0
});

if (r.status !== "UNKNOWN")
  throw new Error("Reality Gate negative test failed");

const hcns =
  require("./src/eons/hcns/m3-hcns");

const h = hcns.evaluateHCNS({
  hope: true,
  care: true,
  need: true,
  shalom: true
});

if (
  h.evidenceOverride !== false ||
  h.authorizationOverride !== false ||
  h.securityOverride !== false
) {
  throw new Error("HCNS boundary regression");
}

console.log("M7 regression suite: PASS");
NODE
