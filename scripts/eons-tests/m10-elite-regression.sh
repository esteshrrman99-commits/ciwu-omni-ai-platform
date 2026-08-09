#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M10 REGRESSION"

node --check \
  src/eons/elite/orchestrator/elite-orchestrator.js

node <<'NODE'

(async function runM10Regression() {

const {
  EliteOrchestrator
} = require(
  "./src/eons/elite/orchestrator/elite-orchestrator"
);

const {
  EliteEngineeringPipeline
} = require(
  "./src/eons/elite/pipeline/elite-pipeline"
);


/*
 * ==========================================================
 * 0. MODULE FORMAT PROTECTION
 * ==========================================================
 *
 * M10 uses CommonJS.
 *
 * Do not use top-level await with require().
 *
 * Async behavior must remain inside this function.
 */

if (
  typeof require !== "function" ||
  typeof module === "undefined"
) {
  throw new Error(
    "M10 regression requires CommonJS execution"
  );
}

console.log(
  "CommonJS module contract: PASS"
);


/*
 * ==========================================================
 * 1. PREFLIGHT
 * ==========================================================
 */

const orchestrator =
  new EliteOrchestrator();

const preflight =
  orchestrator.preflight();

if (!preflight.preflight)
  throw new Error("M10 preflight failed");

if (preflight.executionEnabled !== false)
  throw new Error(
    "Execution unexpectedly enabled"
  );

console.log("M10 preflight: PASS");


/*
 * ==========================================================
 * 2. VERIFY M9 FAILURE REMAINS IMPOSSIBLE
 * ==========================================================
 */

const pipeline =
  new EliteEngineeringPipeline();

pipeline.begin(
  "M10 recurrence protection"
);

pipeline.plan();
pipeline.inspect();
pipeline.design();
pipeline.implement();
pipeline.test();
pipeline.security();
pipeline.review();

let blocked = false;

try {
  pipeline.learn({
    result: "FAIL"
  });
} catch (error) {
  blocked = true;

  if (
    !String(error.message).includes(
      "Learning requires LIVE_VERIFY"
    )
  ) {
    throw new Error(
      "Unexpected learning guard"
    );
  }
}

if (!blocked)
  throw new Error(
    "M9 REVIEW -> LEARN regression detected"
  );

console.log(
  "M9 REVIEW -> LEARN prevention: PASS"
);


/*
 * ==========================================================
 * 3. FULL ORCHESTRATED LIFECYCLE
 * ==========================================================
 */

const result =
  await orchestrator.run(
    "M10 autonomous engineering test",
    {
      result: "PASS",

      lessons: [
        "Canonical lifecycle must control autonomous engineering.",
        "Previously discovered failures must become regression tests.",
        "Learning requires verified deployment.",
        "Completion requires checkpoint."
      ],

      metrics: {
        autonomousOrchestration: true,
        deterministicGating: true,
        executionDisabled: true
      }
    }
  );

if (result.failed)
  throw new Error(
    `M10 orchestration failed: ${result.error}`
  );

if (result.output.state !== "COMPLETE")
  throw new Error(
    "M10 did not reach COMPLETE"
  );

console.log(
  "Full autonomous orchestration: PASS"
);

console.log(
  "Learning integration: PASS"
);

console.log(
  "Checkpoint integration: PASS"
);


/*
 * ==========================================================
 * 4. VERIFY LEARNING CONTEXT
 * ==========================================================
 */

const lessons =
  orchestrator.getLearningContext();

if (lessons.length < 4)
  throw new Error(
    "Expected learned engineering lessons"
  );

const requiredLessons = [
  "Canonical lifecycle must control autonomous engineering.",
  "Previously discovered failures must become regression tests.",
  "Learning requires verified deployment.",
  "Completion requires checkpoint."
];

for (const required of requiredLessons) {
  if (!lessons.includes(required)) {
    throw new Error(
      `Missing learned lesson: ${required}`
    );
  }
}

console.log(
  "Learned engineering context: PASS"
);


/*
 * ==========================================================
 * 5. VERIFY HISTORY
 * ==========================================================
 */

const history =
  orchestrator.getHistory();

if (history.length !== 1)
  throw new Error(
    "Unexpected orchestration history"
  );

if (history[0].state !== "COMPLETE")
  throw new Error(
    "History did not record COMPLETE"
  );

console.log(
  "Engineering history: PASS"
);


/*
 * ==========================================================
 * 6. VERIFY EXECUTION REMAINS DISABLED
 * ==========================================================
 */

if (
  orchestrator.pipeline.executionEnabled !== false
) {
  throw new Error(
    "Execution default changed unexpectedly"
  );
}

console.log(
  "Execution default disabled: PASS"
);


/*
 * ==========================================================
 * 7. REGRESSION LESSON
 * ==========================================================
 *
 * The M10 failure itself becomes a permanent lesson:
 *
 * - CommonJS files use require().
 * - Top-level await must not be combined with require().
 * - Async regression code must run inside an async function.
 */

const moduleFormatLesson =
  "CommonJS regression tests must not use top-level await with require().";

if (
  typeof moduleFormatLesson !== "string" ||
  moduleFormatLesson.length === 0
) {
  throw new Error(
    "Module-format regression lesson missing"
  );
}

console.log(
  "Module-format failure protection: PASS"
);

console.log(
  "M10 regression: PASS"
);

})().catch(error => {
  console.error(error);
  process.exit(1);
});

NODE
