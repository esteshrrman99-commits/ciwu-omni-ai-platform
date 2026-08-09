"use strict";

/*
 * EONS ELITE M12
 *
 * Controlled Execution Adapter
 *
 * This adapter converts authorized capability requests
 * into narrowly defined deterministic operations.
 *
 * It intentionally does NOT provide arbitrary shell access.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  CapabilityBroker
} = require("./capability-broker");

const OPERATIONS = Object.freeze({
  READ_FILE: "READ_FILE",
  LIST_DIR: "LIST_DIR",
  WRITE_FILE: "WRITE_FILE",
  NODE_CHECK: "NODE_CHECK",
  RUN_REGRESSION: "RUN_REGRESSION",
  GIT_STATUS: "GIT_STATUS",
  GIT_DIFF: "GIT_DIFF"
});

const OPERATION_CAPABILITY = Object.freeze({
  READ_FILE: "READ",
  LIST_DIR: "READ",
  WRITE_FILE: "WRITE",
  NODE_CHECK: "TEST",
  RUN_REGRESSION: "TEST",
  GIT_STATUS: "GIT",
  GIT_DIFF: "GIT"
});

class ExecutionAdapter {
  constructor(options = {}) {
    this.root =
      path.resolve(
        options.root || process.cwd()
      );

    this.broker =
      options.broker ||
      new CapabilityBroker();

    this.dryRun =
      options.dryRun === true;

    this.timeoutMs =
      Number.isInteger(options.timeoutMs)
        ? options.timeoutMs
        : 10000;

    this.auditLog = [];
  }

  resolveTarget(target) {
    if (
      typeof target !== "string" ||
      target.length === 0
    ) {
      throw new Error("Execution target required");
    }

    const resolved =
      path.resolve(this.root, target);

    const relative =
      path.relative(this.root, resolved);

    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative)
    ) {
      throw new Error(
        "Execution target escapes project root"
      );
    }

    return resolved;
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
    const operation =
      request.operation;

    const capability =
      OPERATION_CAPABILITY[operation];

    if (!capability) {
      throw new Error(
        `Unsupported execution operation: ${operation}`
      );
    }

    const expectedCapability =
      request.capability;

    if (expectedCapability !== capability) {
      throw new Error(
        `Capability mismatch: ${operation} requires ${capability}`
      );
    }

    const target =
      request.target || "";

    const resolved =
      target
        ? this.resolveTarget(target)
        : null;

    const authorization =
      this.broker.authorize(
        capability,
        operation
      );

    if (this.dryRun) {
      return this.record({
        operation,
        capability,
        target,
        resolved,
        dryRun: true,
        success: true,
        authorized: true
      });
    }

    const started =
      Date.now();

    try {
      let result;

      switch (operation) {

        case OPERATIONS.READ_FILE:
          result =
            fs.readFileSync(
              resolved,
              "utf8"
            );
          break;

        case OPERATIONS.LIST_DIR:
          result =
            fs.readdirSync(
              resolved,
              { withFileTypes: true }
            ).map(entry => ({
              name: entry.name,
              type: entry.isDirectory()
                ? "directory"
                : "file"
            }));
          break;

        case OPERATIONS.WRITE_FILE:
          fs.writeFileSync(
            resolved,
            String(request.content || ""),
            "utf8"
          );

          result = {
            written: true,
            bytes:
              Buffer.byteLength(
                String(request.content || ""),
                "utf8"
              )
          };

          break;

        case OPERATIONS.NODE_CHECK: {
          const child =
            spawnSync(
              "node",
              ["--check", resolved],
              {
                cwd: this.root,
                encoding: "utf8",
                timeout: this.timeoutMs
              }
            );

          result = {
            exitCode:
              child.status,
            stdout:
              child.stdout || "",
            stderr:
              child.stderr || ""
          };

          if (child.error) {
            throw child.error;
          }

          if (child.status !== 0) {
            throw new Error(
              result.stderr ||
              "Node syntax check failed"
            );
          }

          break;
        }

        case OPERATIONS.RUN_REGRESSION: {
          const allowed =
            new Set([
              "scripts/eons-tests/m10-elite-regression.sh",
              "scripts/eons-tests/m11-execution-regression.sh"
            ]);

          if (!allowed.has(target)) {
            throw new Error(
              "Regression target is not allowlisted"
            );
          }

          const child =
            spawnSync(
              "bash",
              [resolved],
              {
                cwd: this.root,
                encoding: "utf8",
                timeout: this.timeoutMs
              }
            );

          result = {
            exitCode:
              child.status,
            stdout:
              child.stdout || "",
            stderr:
              child.stderr || ""
          };

          if (child.error) {
            throw child.error;
          }

          if (child.status !== 0) {
            throw new Error(
              result.stderr ||
              "Regression failed"
            );
          }

          break;
        }

        case OPERATIONS.GIT_STATUS: {
          const child =
            spawnSync(
              "git",
              ["status", "--short"],
              {
                cwd: this.root,
                encoding: "utf8",
                timeout: this.timeoutMs
              }
            );

          result = {
            exitCode:
              child.status,
            output:
              child.stdout || ""
          };

          break;
        }

        case OPERATIONS.GIT_DIFF: {
          const child =
            spawnSync(
              "git",
              ["diff", "--stat"],
              {
                cwd: this.root,
                encoding: "utf8",
                timeout: this.timeoutMs
              }
            );

          result = {
            exitCode:
              child.status,
            output:
              child.stdout || ""
          };

          break;
        }

        default:
          throw new Error(
            `Unhandled operation: ${operation}`
          );
      }

      return this.record({
        operation,
        capability,
        target,
        resolved,
        authorized:
          authorization.allowed,
        dryRun: false,
        success: true,
        durationMs:
          Date.now() - started,
        result
      });

    } catch (error) {
      return this.record({
        operation,
        capability,
        target,
        resolved,
        authorized: true,
        dryRun: false,
        success: false,
        durationMs:
          Date.now() - started,
        error: error.message
      });
    }
  }

  audit() {
    return [...this.auditLog];
  }
}

module.exports = {
  OPERATIONS,
  OPERATION_CAPABILITY,
  ExecutionAdapter
};
