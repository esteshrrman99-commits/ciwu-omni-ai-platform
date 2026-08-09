#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M9 REGRESSION"

node --check src/eons/elite/status-machine.js
node --check src/eons/elite/memory/engineering-memory.js
node --check src/eons/elite/pipeline/elite-pipeline.js
node --check src/eons/elite/security/elite-policy.js
node --check src/eons/elite/agents/llm-contract.js

node <<'NODE'

const {
  EliteStatusMachine
} = require("./src/eons/elite/status-machine");

const {
  EngineeringMemory
} = require("./src/eons/elite/memory/engineering-memory");

const {
  EliteEngineeringPipeline
} = require("./src/eons/elite/pipeline/elite-pipeline");

const {
  ELITE_POLICY,
  validatePolicy
} = require("./src/eons/elite/security/elite-policy");


/*
 * ==========================================================
 * 1. STATUS MACHINE
 * ==========================================================
 */

const machine = new EliteStatusMachine();

const lifecycle = [
  "INTAKE",
  "PLAN",
  "INSPECT",
  "DESIGN",
  "IMPLEMENT",
  "TEST",
  "SECURITY",
  "REVIEW",
  "STAGE",
  "COMMIT",
  "PUSH",
  "DEPLOY",
  "LIVE_VERIFY",
  "LEARN",
  "CHECKPOINT",
  "COMPLETE"
];

for (const state of lifecycle) {
  machine.transition(state);
}

if (machine.state !== "COMPLETE") {
  throw new Error("Elite status machine failed");
}

console.log("Complete status lifecycle: PASS");


/*
 * ==========================================================
 * 2. SAFETY POLICY
 * ==========================================================
 */

validatePolicy();

if (ELITE_POLICY.executionDefault !== false) {
  throw new Error(
    "Execution default must remain disabled"
  );
}

console.log("Safety policy: PASS");


/*
 * ==========================================================
 * 3. ENGINEERING MEMORY
 * ==========================================================
 */

const memory = new EngineeringMemory();

memory.record({
  objective: "M9 test",
  result: "PASS",
  lessons: [
    "Deterministic verification should precede completion."
  ]
});

if (memory.recent(1).length !== 1) {
  throw new Error("Engineering memory failed");
}

console.log("Engineering memory: PASS");


/*
 * ==========================================================
 * 4. EXACT M9 FAILURE REPRODUCTION
 * ==========================================================
 *
 * The original failure was:
 *
 * REVIEW -> LEARN
 *
 * That transition must NEVER become legal accidentally.
 */

const failureProtection =
  new EliteEngineeringPipeline();

failureProtection.begin(
  "M9 transition failure protection"
);

failureProtection.plan();
failureProtection.inspect();
failureProtection.design();
failureProtection.implement();
failureProtection.test();
failureProtection.security();
failureProtection.review();

let failureBlocked = false;

try {
  failureProtection.learn({
    objective: "M9 transition failure protection",
    result: "FAIL"
  });
} catch (error) {
  failureBlocked = true;

  if (
    !String(error.message).includes(
      "Learning requires LIVE_VERIFY"
    )
  ) {
    throw new Error(
      "Unexpected learning guard error"
    );
  }
}

if (!failureBlocked) {
  throw new Error(
    "REGRESSION: REVIEW -> LEARN was not blocked"
  );
}

console.log(
  "Original REVIEW -> LEARN failure: PROTECTED"
);


/*
 * ==========================================================
 * 5. FULL PIPELINE
 * ==========================================================
 */

const pipeline =
  new EliteEngineeringPipeline();

pipeline.begin(
  "M9 autonomous engineering lifecycle"
);

const result =
  pipeline.runControlledLifecycle({
    objective:
      "M9 autonomous engineering lifecycle",

    result: "PASS",

    lessons: [
      "The pipeline must never bypass lifecycle states.",
      "Learning is valid only after live verification.",
      "Autonomous orchestration must use one canonical lifecycle.",
      "Regression tests must reproduce previously discovered failures."
    ],

    metrics: {
      lifecycleIntegrity: true,
      executionDefaultDisabled: true,
      transitionGuard: true
    }
  });

if (result.state !== "COMPLETE") {
  throw new Error(
    "Controlled lifecycle did not complete"
  );
}

if (result.executionEnabled !== false) {
  throw new Error(
    "Execution unexpectedly enabled"
  );
}

if (!result.learning) {
  throw new Error(
    "Learning record missing"
  );
}

if (
  pipeline.memory.successful(1).length !== 1
) {
  throw new Error(
    "Successful learning record missing"
  );
}

console.log(
  "Full autonomous lifecycle: PASS"
);

console.log(
  "Learning after LIVE_VERIFY: PASS"
);

console.log(
  "Execution default disabled: PASS"
);


/*
 * ==========================================================
 * 6. LEARNING FROM THE ACTUAL M9 FAILURE
 * ==========================================================
 */

const lessons =
  pipeline.memory.deriveLessons();

const requiredLessons = [
  "The pipeline must never bypass lifecycle states.",
  "Learning is valid only after live verification.",
  "Autonomous orchestration must use one canonical lifecycle.",
  "Regression tests must reproduce previously discovered failures."
];

for (const required of requiredLessons) {
  if (
    !lessons.some(entry =>
      entry.lesson === required
    )
  ) {
    throw new Error(
      `Missing learned lesson: ${required}`
    );
  }
}

console.log(
  "M9 failure-learning protection: PASS"
);

console.log(
  "M9 regression: PASS"
);

NODE
