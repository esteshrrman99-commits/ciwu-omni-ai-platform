"use strict";

const {
  EliteEngineeringPipeline
} = require("../pipeline/elite-pipeline");

const {
  STATES,
  TRANSITIONS
} = require("../status-machine");

const {
  validatePolicy
} = require("../security/elite-policy");

/*
 * EONS ELITE AUTONOMOUS ENGINEERING ORCHESTRATOR
 *
 * The orchestrator does NOT invent its own lifecycle.
 *
 * EliteStatusMachine is the canonical authority.
 *
 * The orchestrator:
 *
 * 1. Preflights the lifecycle.
 * 2. Begins an engineering run.
 * 3. Executes only canonical pipeline stages.
 * 4. Refuses illegal transitions.
 * 5. Records failures as lessons.
 * 6. Prevents learning before LIVE_VERIFY.
 * 7. Prevents completion before CHECKPOINT.
 *
 * LLMs may propose.
 * Deterministic controls decide.
 */

class EliteOrchestrator {
  constructor(options = {}) {
    this.pipeline = new EliteEngineeringPipeline({
      executionEnabled:
        options.executionEnabled === true
    });

    this.learningContext = [];
    this.runHistory = [];
  }

  preflight() {
    validatePolicy();

    const required = [
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

    for (let i = 0; i < required.length - 1; i++) {
      const current = required[i];
      const next = required[i + 1];

      if (
        !Array.isArray(TRANSITIONS[current]) ||
        !TRANSITIONS[current].includes(next)
      ) {
        throw new Error(
          `Lifecycle integrity failure: ${current} -> ${next}`
        );
      }
    }

    if (!STATES.includes("FAILED")) {
      throw new Error("FAILED state missing");
    }

    return {
      preflight: true,
      lifecycle: required,
      executionEnabled:
        this.pipeline.executionEnabled
    };
  }

  begin(objective) {
    this.preflight();

    const context = {
      objective,
      priorLessons: [...this.learningContext]
    };

    return this.pipeline.begin(context);
  }

  async run(objective, result = {}) {
    const runContext = this.begin(objective);

    try {
      const output =
        this.pipeline.runControlledLifecycle({
          objective,
          result:
            result.result || "PASS",

          failures:
            result.failures || [],

          lessons: [
            ...this.learningContext,
            ...(result.lessons || [])
          ],

          metrics:
            result.metrics || {}
        });

      const record = {
        objective,
        result:
          result.result || "PASS",
        state: output.state,
        timestamp: new Date().toISOString()
      };

      this.runHistory.push(record);

      const lessons =
        this.pipeline.memory.deriveLessons();

      this.learningContext =
        lessons.map(entry => entry.lesson);

      return {
        runContext,
        output,
        learnedLessons:
          [...this.learningContext],
        history:
          [...this.runHistory]
      };
    } catch (error) {
      const failure = {
        objective,
        result: "FAIL",
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.runHistory.push(failure);

      if (this.pipeline.status.state !== "FAILED") {
        this.pipeline.status.fail(error.message);
      }

      return {
        runContext,
        failed: true,
        error: error.message,
        state: this.pipeline.status.state
      };
    }
  }

  getLearningContext() {
    return [...this.learningContext];
  }

  getHistory() {
    return [...this.runHistory];
  }
}

module.exports = {
  EliteOrchestrator
};
