"use strict";

/*
 * EONS ELITE M14
 *
 * Policy-Gated Execution Orchestrator
 *
 * Control flow:
 *
 * REQUEST
 *    ↓
 * M13 POLICY
 *    ↓
 * APPROVAL / DENIAL
 *    ↓
 * M12 EXECUTION ADAPTER
 *    ↓
 * VERIFY
 *    ↓
 * AUDIT
 *
 * M14 does not bypass M13.
 * M14 does not introduce new dangerous capabilities.
 */

const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require("./execution-policy");

const adapterModule =
  require("./execution-adapter");

class ExecutionOrchestrator {

  constructor(options = {}) {

    this.policy =
      options.policy ||
      new ExecutionPolicy({
        root:
          options.root ||
          process.cwd()
      });

    this.adapter =
      options.adapter ||
      adapterModule;

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

  execute(request = {}) {

    const requestId =
      typeof request.requestId === "string" &&
      request.requestId.length > 0
        ? request.requestId
        : null;

    if (!requestId) {

      return this.record({
        decision:
          POLICY_DECISIONS.DENY,
        phase: "REQUEST",
        reason:
          "requestId required"
      });
    }

    /*
     * M13 IS THE REQUIRED AUTHORIZATION GATE.
     *
     * There is intentionally no execution path
     * before this evaluation completes.
     */

    const policyResult =
      this.policy.evaluate(request);

    this.record({
      requestId,
      phase: "POLICY",
      decision:
        policyResult.decision,
      reason:
        policyResult.reason
    });

    if (
      policyResult.decision !==
      POLICY_DECISIONS.ALLOW
    ) {

      return this.record({
        requestId,
        phase: "EXECUTION",
        decision:
          policyResult.decision,
        executed: false,
        reason:
          policyResult.reason
      });
    }

    /*
     * Only an explicit ALLOW reaches this point.
     */

    if (
      !this.adapter ||
      typeof this.adapter !== "object"
    ) {

      return this.record({
        requestId,
        phase: "EXECUTION",
        decision:
          POLICY_DECISIONS.DENY,
        executed: false,
        reason:
          "execution adapter unavailable"
      });
    }

    /*
     * M14 deliberately supports a narrow adapter contract.
     *
     * The adapter must expose an explicit execution method.
     */

    const executeFn =
      typeof this.adapter.execute === "function"
        ? this.adapter.execute
        : null;

    if (!executeFn) {

      return this.record({
        requestId,
        phase: "EXECUTION",
        decision:
          POLICY_DECISIONS.DENY,
        executed: false,
        reason:
          "execution adapter contract unavailable"
      });
    }

    let executionResult;

    try {

      executionResult =
        executeFn.call(
          this.adapter,
          request
        );

    } catch (error) {

      return this.record({
        requestId,
        phase: "EXECUTION",
        decision:
          POLICY_DECISIONS.DENY,
        executed: false,
        reason:
          "execution adapter error",
        error:
          error instanceof Error
            ? error.message
            : String(error)
      });
    }

    /*
     * Verification is intentionally conservative.
     *
     * A successful adapter return is not treated as
     * proof of arbitrary external-world success.
     */

    const verified =
      executionResult !== undefined &&
      executionResult !== null;

    const finalResult =
      this.record({
        requestId,
        phase: "VERIFY",
        decision:
          verified
            ? POLICY_DECISIONS.ALLOW
            : POLICY_DECISIONS.DENY,
        executed: true,
        verified
      });

    return {
      ...finalResult,
      executionResult
    };
  }

  audit() {

    return [
      ...this.auditLog,
      ...this.policy.audit()
    ];
  }
}

module.exports = {
  ExecutionOrchestrator
};
