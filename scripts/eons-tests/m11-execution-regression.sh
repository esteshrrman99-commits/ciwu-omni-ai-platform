#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M11 EXECUTION REGRESSION"

echo "1/8 Node availability"
node --version
echo "Node: PASS"

echo "2/8 Capability broker syntax"
node --check src/eons/elite/execution/capability-broker.js
echo "Syntax: PASS"

echo "3/8 Capability broker load"

node <<'NODE'
"use strict";

const {
  CAPABILITIES,
  DEFAULT_POLICY,
  CapabilityBroker
} = require("./src/eons/elite/execution/capability-broker");

if (!Array.isArray(CAPABILITIES)) {
  throw new Error("CAPABILITIES is not an array");
}

const required = [
  "READ",
  "WRITE",
  "TEST",
  "GIT",
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
];

for (const capability of required) {
  if (!CAPABILITIES.includes(capability)) {
    throw new Error("Missing capability: " + capability);
  }
}

console.log("Capability inventory: PASS");

if (DEFAULT_POLICY.READ !== true)
  throw new Error("READ default must be enabled");

if (DEFAULT_POLICY.TEST !== true)
  throw new Error("TEST default must be enabled");

for (const capability of [
  "WRITE",
  "GIT",
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
]) {
  if (DEFAULT_POLICY[capability] !== false) {
    throw new Error(
      capability + " must remain disabled by default"
    );
  }
}

console.log("Safe default policy: PASS");

const broker = new CapabilityBroker();

broker.authorize("READ", "regression");
broker.authorize("TEST", "regression");

console.log("READ/TEST authorization: PASS");

for (const capability of [
  "WRITE",
  "GIT",
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
]) {
  let blocked = false;

  try {
    broker.authorize(capability, "blocked regression");
  } catch (error) {
    blocked = true;

    if (
      !String(error.message).includes(
        "Execution capability denied"
      )
    ) {
      throw error;
    }
  }

  if (!blocked) {
    throw new Error(
      capability + " was not blocked"
    );
  }
}

console.log("Dangerous capability blocking: PASS");

const elevated = new CapabilityBroker({
  policy: {
    WRITE: true,
    GIT: true
  }
});

elevated.authorize(
  "WRITE",
  "explicitly authorized test"
);

elevated.authorize(
  "GIT",
  "explicitly authorized test"
);

if (elevated.enabled("PUSH") !== false)
  throw new Error("PUSH unexpectedly enabled");

if (elevated.enabled("DEPLOY") !== false)
  throw new Error("DEPLOY unexpectedly enabled");

if (elevated.enabled("CREDENTIALS") !== false)
  throw new Error(
    "CREDENTIALS unexpectedly enabled"
  );

console.log("Explicit elevation boundaries: PASS");

const audit = elevated.audit();

if (audit.length !== 2)
  throw new Error("Audit count mismatch");

for (const event of audit) {
  if (!event.timestamp)
    throw new Error("Missing audit timestamp");

  if (!event.capability)
    throw new Error("Missing audit capability");

  if (typeof event.allowed !== "boolean")
    throw new Error("Missing audit authorization result");
}

console.log("Audit trail: PASS");

let unknownBlocked = false;

try {
  broker.authorize(
    "ROOT_SHELL",
    "unauthorized"
  );
} catch (_) {
  unknownBlocked = true;
}

if (!unknownBlocked)
  throw new Error(
    "Unknown capability was accepted"
  );

console.log("Unknown capability protection: PASS");

console.log("M11 execution fabric regression: PASS");
NODE

echo "4/8 M10 regression"
bash scripts/eons-tests/m10-elite-regression.sh
echo "M10 prerequisite: PASS"

echo "5/8 M11 file integrity"
test -f src/eons/elite/execution/capability-broker.js
test -f scripts/eons-tests/m11-execution-regression.sh
echo "M11 files: PASS"

echo "6/8 Secret filename scan"
if git diff --name-only --cached |
grep -E '(^|/)(\.env|\.env\..*|.*\.pem|.*\.key|id_rsa.*|id_ed25519.*)$'
then
  echo "FAIL: possible secret staged."
  exit 1
fi
echo "Secret scan: PASS"

echo "7/8 Execution safety"
node <<'NODE'
const {
  CapabilityBroker
} = require("./src/eons/elite/execution/capability-broker");

const broker = new CapabilityBroker();

if (broker.enabled("WRITE") !== false)
  throw new Error("WRITE is not safely disabled");

if (broker.enabled("PUSH") !== false)
  throw new Error("PUSH is not safely disabled");

if (broker.enabled("DEPLOY") !== false)
  throw new Error("DEPLOY is not safely disabled");

if (broker.enabled("NETWORK") !== false)
  throw new Error("NETWORK is not safely disabled");

if (broker.enabled("CREDENTIALS") !== false)
  throw new Error("CREDENTIALS is not safely disabled");

console.log("Execution safety: PASS");
NODE

echo "8/8 COMPLETE"
echo "🧠 M11 EXECUTION REGRESSION: PASS"
