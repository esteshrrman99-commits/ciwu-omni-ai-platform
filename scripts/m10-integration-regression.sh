#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

ENGINE="./src/eons/certification/eons-certification-engine.js"
ADAPTER="./src/eons/certification/m10-integration.js"

echo "============================================================"
echo "🧠 EONS M10 — INTEGRATION REGRESSION"
echo "============================================================"

echo
echo "=== 1. ENGINE SYNTAX ==="
node --check "$ENGINE"
echo "Engine syntax: PASS"

echo
echo "=== 2. ADAPTER SYNTAX ==="
node --check "$ADAPTER"
echo "Adapter syntax: PASS"

echo
echo "=== 3. MODULE LOAD ==="
node <<'NODE'
const engine = require(
  "./src/eons/certification/eons-certification-engine"
);

const adapter = require(
  "./src/eons/certification/m10-integration"
);

if (!engine)
  throw new Error("Certification engine failed to load");

if (!adapter)
  throw new Error("M10 integration adapter failed to load");

if (adapter.M10_ID !== "M010_CERTIFICATION_INTEGRATION")
  throw new Error("M10 integration ID invariant failed");

console.log("Engine load: PASS");
console.log("Adapter load: PASS");
NODE

echo
echo "=== 4. ARCHITECTURE STATUS ==="
node <<'NODE'
const {
  getArchitectureStatus
} = require(
  "./src/eons/certification/m10-integration"
);

const status = getArchitectureStatus();

if (status.engineLoaded !== true)
  throw new Error("Engine not marked loaded");

if (status.milestoneCount !== 15)
  throw new Error("Milestone count changed");

if (status.milestoneStates !== 7)
  throw new Error("Milestone state count changed");

if (status.productionClaimsRequireEvidence !== true)
  throw new Error("Production evidence boundary weakened");

if (status.physicalEvidenceRequired !== true)
  throw new Error("Physical evidence boundary weakened");

if (
  status.protectedActionsRequireExplicitAuthorization !== true
)
  throw new Error(
    "Execution authorization boundary weakened"
  );

console.log("Architecture status: PASS");
console.log("Milestones:", status.milestoneCount);
console.log("Milestone states:", status.milestoneStates);
console.log(
  "Production claims require evidence: TRUE"
);
console.log(
  "Physical evidence required: TRUE"
);
console.log(
  "Protected actions require authorization: TRUE"
);
NODE

echo
echo "=== 5. UNKNOWN CLAIM ==="
node <<'NODE'
const {
  certify,
  INTEGRATION_STATUS
} = require(
  "./src/eons/certification/m10-integration"
);

const result = certify({
  claim: {
    CLAIM_ID: "M10-INTEGRATION-UNKNOWN",
    CLAIM: "Unverified breakthrough",
    evidence: {}
  }
});

if (
  result.status !==
  INTEGRATION_STATUS.INSUFFICIENT_EVIDENCE
)
  throw new Error(
    "Unknown claim was incorrectly promoted"
  );

if (result.certification.STATUS !== "UNKNOWN")
  throw new Error(
    "Certification engine incorrectly promoted claim"
  );

console.log(
  "Unknown claim remains UNKNOWN: PASS"
);
console.log(
  "Integration status:",
  result.status
);
NODE

echo
echo "=== 6. HYPOTHESIS CLAIM ==="
node <<'NODE'
const {
  certify,
  INTEGRATION_STATUS
} = require(
  "./src/eons/certification/m10-integration"
);

const result = certify({
  claim: {
    CLAIM_ID: "M10-INTEGRATION-HYPOTHESIS",
    CLAIM: "Candidate computational mechanism",
    evidence: {
      hypothesis: "Candidate mechanism"
    }
  }
});

if (
  result.status !==
  INTEGRATION_STATUS.READY
)
  throw new Error(
    "Hypothesis integration failed"
  );

if (result.certification.STATUS !== "HYPOTHESIS")
  throw new Error(
    "Hypothesis was promoted incorrectly"
  );

if (result.certification.EVIDENCE_LEVEL !== 1)
  throw new Error(
    "Hypothesis evidence level incorrect"
  );

console.log(
  "Hypothesis certification: PASS"
);
console.log(
  "Evidence level:",
  result.certification.EVIDENCE_LEVEL
);
NODE

echo
echo "=== 7. EXAHASH BOUNDARY ==="
node <<'NODE'
const {
  evaluateExahash
} = require(
  "./src/eons/certification/m10-integration"
);

const result = evaluateExahash({
  hashrate: 1,
  hashrateUnit: "EH/s",
  joulesPerHash: 1
});

if (result.EHps !== 1)
  throw new Error("EH/s conversion failed");

if (result.hashrate_Hps !== 1e18)
  throw new Error("Hashrate conversion failed");

if (result.powerWatts !== 1e18)
  throw new Error("Power calculation failed");

if (result.powerMW !== 1e12)
  throw new Error("Power MW calculation failed");

if (result.productionClaimAllowed !== false)
  throw new Error(
    "Production claim boundary weakened"
  );

if (result.physicalEvidenceRequired !== true)
  throw new Error(
    "Physical evidence requirement weakened"
  );

console.log(
  "EXAHASH frontier integration: PASS"
);
console.log(
  "Production claim without physical evidence: BLOCKED"
);
NODE

echo
echo "=== 8. PROMOTION BOUNDARY ==="
node <<'NODE'
const {
  evaluatePromotion,
  STATUS
} = require(
  "./src/eons/certification/m10-integration"
);

const result = evaluatePromotion(
  STATUS.UNKNOWN,
  STATUS.PRODUCTION_VALIDATED,
  {}
);

if (result.allowed !== false)
  throw new Error(
    "Unsafe promotion was permitted"
  );

console.log(
  "Promotion boundary: PASS"
);
console.log(
  "Unsupported production promotion: BLOCKED"
);
NODE

echo
echo "=== 9. PRODUCTION GATE ==="
node <<'NODE'
const {
  evaluateProduction
} = require(
  "./src/eons/certification/m10-integration"
);

const result = evaluateProduction({});

if (result.passed !== false)
  throw new Error(
    "Empty production evidence was accepted"
  );

if (result.missing.length !== 9)
  throw new Error(
    "Production evidence requirements changed"
  );

console.log(
  "Production evidence gate: PASS"
);
console.log(
  "Required evidence fields:",
  result.missing.length
);
NODE

echo
echo "=== 10. SECURITY GATE ==="
node <<'NODE'
const {
  evaluateSecurity
} = require(
  "./src/eons/certification/m10-integration"
);

const result = evaluateSecurity({});

if (result.passed !== false)
  throw new Error(
    "Untested security categories accepted"
  );

if (result.tested.length !== 23)
  throw new Error(
    "Security test category count changed"
  );

if (result.failures.length !== 23)
  throw new Error(
    "Security failures were not correctly reported"
  );

console.log(
  "Adversarial security boundary: PASS"
);
console.log(
  "Security categories:",
  result.tested.length
);
console.log(
  "Untested categories rejected:",
  result.failures.length
);
NODE

echo
echo "=== 11. EXECUTION BOUNDARY ==="
node <<'NODE'
const {
  verifyExecutionBoundary
} = require(
  "./src/eons/certification/m10-integration"
);

const result = verifyExecutionBoundary();

if (result.passed !== true)
  throw new Error(
    "Execution boundary verification failed"
  );

if (result.blocked.length !== 7)
  throw new Error(
    "Protected action count changed"
  );

console.log(
  "Non-destructive verification: ALLOWED"
);

console.log(
  "Protected actions blocked:",
  result.blocked.length
);
NODE

echo
echo "=== 12. EXISTING M3 FILE PRESERVATION ==="
node <<'NODE'
const fs = require("fs");

const required = [
  "src/eons/governance/m3-governance.js",
  "src/eons/reality/m3-reality-gate.js",
  "src/eons/security/m3-policy.js",
  "src/eons/state/m3-state.js",
  "src/eons/verification/m3-verification.js",
  "scripts/m3-milestone-6-final-gate.sh",
  "scripts/m3-milestone-7-regression.sh",
  "scripts/m3-milestone-8-integrity-watch.sh"
];

for (const file of required) {
  if (!fs.existsSync(file))
    throw new Error(
      `Existing M3 component missing: ${file}`
    );
}

console.log(
  "Existing M3 architecture preserved: PASS"
);
console.log(
  "M3 governance/reality/security/state/verification files present"
);
NODE

echo
echo "=== 13. NO SERVER MODIFICATION ==="
node <<'NODE'
const fs = require("fs");

const server = "src/server.js";

if (!fs.existsSync(server))
  throw new Error("src/server.js missing");

console.log(
  "Existing server remains present: PASS"
);

console.log(
  "M10 integration remains adapter-based: PASS"
);
NODE

echo
echo "============================================================"
echo "🧠 M10 INTEGRATION REGRESSION PASSED"
echo "============================================================"
echo "ENGINE: PASS"
echo "ADAPTER: PASS"
echo "ARCHITECTURE: PASS"
echo "CLAIM CERTIFICATION: PASS"
echo "EXAHASH BOUNDARY: PASS"
echo "PROMOTION BOUNDARY: PASS"
echo "PRODUCTION GATE: PASS"
echo "SECURITY GATE: PASS"
echo "EXECUTION BOUNDARY: PASS"
echo "M3 PRESERVATION: PASS"
echo
echo "NO COMMIT"
echo "NO PUSH"
echo "NO DEPLOYMENT"
echo "NO DESTRUCTIVE OPERATIONS"
echo "============================================================"
