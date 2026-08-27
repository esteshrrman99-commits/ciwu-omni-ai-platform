"use strict";

/*
 * EONS ELITE STATUS MACHINE
 *
 * Controlled autonomous engineering lifecycle.
 *
 * The machine may reason, inspect, test, verify and learn.
 * Dangerous execution remains explicitly gated.
 */

const STATES = Object.freeze([
  "IDLE",
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
  "COMPLETE",
  "FAILED"
]);

const TRANSITIONS = Object.freeze({
  IDLE: ["INTAKE"],
  INTAKE: ["PLAN"],
  PLAN: ["INSPECT"],
  INSPECT: ["DESIGN"],
  DESIGN: ["IMPLEMENT"],
  IMPLEMENT: ["TEST"],
  TEST: ["SECURITY"],
  SECURITY: ["REVIEW"],
  REVIEW: ["STAGE"],
  STAGE: ["COMMIT"],
  COMMIT: ["PUSH"],
  PUSH: ["DEPLOY"],
  DEPLOY: ["LIVE_VERIFY"],
  LIVE_VERIFY: ["LEARN"],
  LEARN: ["CHECKPOINT"],
  CHECKPOINT: ["COMPLETE"],
  COMPLETE: ["INTAKE"],
  FAILED: ["INTAKE"]
});

class EliteStatusMachine {
  constructor() {
    this.state = "IDLE";
    this.history = [];
  }

  transition(next) {
    const allowed = TRANSITIONS[this.state] || [];

    if (!allowed.includes(next)) {
      throw new Error(
        `Invalid EONS transition: ${this.state} -> ${next}`
      );
    }

    this.history.push({
      from: this.state,
      to: next,
      timestamp: new Date().toISOString()
    });

    this.state = next;

    return this.snapshot();
  }

  fail(reason) {
    this.history.push({
      from: this.state,
      to: "FAILED",
      reason,
      timestamp: new Date().toISOString()
    });

    this.state = "FAILED";

    return this.snapshot();
  }

  snapshot() {
    return {
      state: this.state,
      history: [...this.history]
    };
  }
}

module.exports = {
  STATES,
  TRANSITIONS,
  EliteStatusMachine
};
