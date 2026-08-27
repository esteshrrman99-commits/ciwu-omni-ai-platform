"use strict";

/*
 * EONS ELITE M13
 *
 * Execution Policy & Transaction Gate
 *
 * The policy layer decides whether an execution request
 * is permitted BEFORE it reaches the execution adapter.
 *
 * This module does not execute commands.
 */

const POLICY_DECISIONS = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED"
});

const RISK_LEVELS = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
});

const OPERATION_RULES = Object.freeze({
  READ_FILE: {
    capability: "READ",
    risk: RISK_LEVELS.LOW,
    approval: false
  },

  LIST_DIR: {
    capability: "READ",
    risk: RISK_LEVELS.LOW,
    approval: false
  },

  NODE_CHECK: {
    capability: "TEST",
    risk: RISK_LEVELS.LOW,
    approval: false
  },

  RUN_REGRESSION: {
    capability: "TEST",
    risk: RISK_LEVELS.LOW,
    approval: false
  },

  WRITE_FILE: {
    capability: "WRITE",
    risk: RISK_LEVELS.MEDIUM,
    approval: true
  },

  GIT_STATUS: {
    capability: "GIT",
    risk: RISK_LEVELS.LOW,
    approval: false
  },

  GIT_DIFF: {
    capability: "GIT",
    risk: RISK_LEVELS.LOW,
    approval: false
  }
});

const ALWAYS_DENIED_CAPABILITIES = new Set([
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
]);

class ExecutionPolicy {

  constructor(options = {}) {
    this.root =
      options.root ||
      process.cwd();

    this.maxRequestSize =
      Number.isInteger(options.maxRequestSize)
        ? options.maxRequestSize
        : 10000;

    this.auditLog = [];
  }

  record(event) {
    const entry = {
      timestamp:
        new Date().toISOString(),
      ...event
    };

    this.auditLog.push(entry);

    return entry;
  }

  evaluate(request = {}) {

    const operation =
      request.operation;

    const capability =
      request.capability;

    const requestId =
      typeof request.requestId === "string" &&
      request.requestId.length > 0
        ? request.requestId
        : null;

    if (!requestId) {
      return this.record({
        decision: POLICY_DECISIONS.DENY,
        reason: "requestId required"
      });
    }

    if (!operation) {
      return this.record({
        requestId,
        decision: POLICY_DECISIONS.DENY,
        reason: "operation required"
      });
    }

    if (!capability) {
      return this.record({
        requestId,
        decision: POLICY_DECISIONS.DENY,
        reason: "capability required"
      });
    }

    const serialized =
      JSON.stringify(request);

    if (
      Buffer.byteLength(
        serialized,
        "utf8"
      ) > this.maxRequestSize
    ) {
      return this.record({
        requestId,
        decision: POLICY_DECISIONS.DENY,
        reason: "request exceeds size limit"
      });
    }

    if (
      ALWAYS_DENIED_CAPABILITIES.has(
        capability
      )
    ) {
      return this.record({
        requestId,
        operation,
        capability,
        decision: POLICY_DECISIONS.DENY,
        reason:
          "capability permanently denied by M13 policy"
      });
    }

    const rule =
      OPERATION_RULES[operation];

    if (!rule) {
      return this.record({
        requestId,
        operation,
        capability,
        decision: POLICY_DECISIONS.DENY,
        reason:
          "operation not present in policy"
      });
    }

    if (
      rule.capability !== capability
    ) {
      return this.record({
        requestId,
        operation,
        capability,
        decision: POLICY_DECISIONS.DENY,
        reason:
          `capability mismatch: expected ${rule.capability}`
      });
    }

    if (
      operation === "WRITE_FILE" &&
      request.approved !== true
    ) {
      return this.record({
        requestId,
        operation,
        capability,
        risk: rule.risk,
        decision:
          POLICY_DECISIONS.APPROVAL_REQUIRED,
        reason:
          "WRITE_FILE requires explicit approval"
      });
    }

    return this.record({
      requestId,
      operation,
      capability,
      risk: rule.risk,
      decision: POLICY_DECISIONS.ALLOW,
      reason: "policy satisfied"
    });
  }

  authorize(request = {}) {
    const result =
      this.evaluate(request);

    if (
      result.decision ===
      POLICY_DECISIONS.DENY
    ) {
      throw new Error(
        `Execution policy denied: ${result.reason}`
      );
    }

    if (
      result.decision ===
      POLICY_DECISIONS.APPROVAL_REQUIRED
    ) {
      throw new Error(
        `Execution policy approval required: ${result.reason}`
      );
    }

    return result;
  }

  audit() {
    return [...this.auditLog];
  }
}

module.exports = {
  POLICY_DECISIONS,
  RISK_LEVELS,
  OPERATION_RULES,
  ExecutionPolicy
};
