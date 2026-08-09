#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M13 EXECUTION POLICY REGRESSION"

echo "1/12 Node availability"
node --version
echo "Node: PASS"

echo "2/12 Policy syntax"

node --check \
  src/eons/elite/execution/execution-policy.js

echo "Syntax: PASS"

echo "3/12 Policy loading"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS,
  OPERATION_RULES
} = require(
  "./src/eons/elite/execution/execution-policy"
);

if (!ExecutionPolicy)
  throw new Error("ExecutionPolicy missing");

if (!POLICY_DECISIONS.ALLOW)
  throw new Error("Policy decisions missing");

if (!OPERATION_RULES.READ_FILE)
  throw new Error("Operation rules missing");

console.log("Policy load: PASS");
NODE

echo "4/12 Safe READ policy"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

const result =
  policy.evaluate({
    requestId: "m13-read-001",
    operation: "READ_FILE",
    capability: "READ",
    target: "README.md"
  });

if (
  result.decision !==
  POLICY_DECISIONS.ALLOW
)
  throw new Error(
    "READ should be allowed"
  );

console.log("READ policy: PASS");
NODE

echo "5/12 TEST policy"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

const result =
  policy.evaluate({
    requestId: "m13-test-001",
    operation: "NODE_CHECK",
    capability: "TEST",
    target:
      "src/eons/elite/execution/execution-policy.js"
  });

if (
  result.decision !==
  POLICY_DECISIONS.ALLOW
)
  throw new Error(
    "TEST should be allowed"
  );

console.log("TEST policy: PASS");
NODE

echo "6/12 WRITE approval boundary"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

const result =
  policy.evaluate({
    requestId: "m13-write-001",
    operation: "WRITE_FILE",
    capability: "WRITE",
    target: "example.txt"
  });

if (
  result.decision !==
  POLICY_DECISIONS.APPROVAL_REQUIRED
)
  throw new Error(
    "WRITE should require approval"
  );

console.log("WRITE approval boundary: PASS");
NODE

echo "7/12 Approved WRITE"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

const result =
  policy.evaluate({
    requestId: "m13-write-002",
    operation: "WRITE_FILE",
    capability: "WRITE",
    target: "example.txt",
    approved: true
  });

if (
  result.decision !==
  POLICY_DECISIONS.ALLOW
)
  throw new Error(
    "Approved WRITE should be allowed"
  );

console.log("Approved WRITE policy: PASS");
NODE

echo "8/12 Dangerous capability denial"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

for (const capability of [
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
]) {

  const result =
    policy.evaluate({
      requestId:
        `m13-deny-${capability}`,
      operation: "READ_FILE",
      capability
    });

  if (
    result.decision !==
    POLICY_DECISIONS.DENY
  ) {
    throw new Error(
      `${capability} was not denied`
    );
  }
}

console.log("Dangerous capability denial: PASS");
NODE

echo "9/12 Capability mismatch"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

const result =
  policy.evaluate({
    requestId: "m13-mismatch-001",
    operation: "READ_FILE",
    capability: "WRITE"
  });

if (
  result.decision !==
  POLICY_DECISIONS.DENY
)
  throw new Error(
    "Capability mismatch was not denied"
  );

console.log("Capability mismatch: PASS");
NODE

echo "10/12 Request validation"

node <<'NODE'
const {
  ExecutionPolicy,
  POLICY_DECISIONS
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

for (const request of [
  {},
  {
    requestId: "missing-operation",
    capability: "READ"
  },
  {
    requestId: "missing-capability",
    operation: "READ_FILE"
  }
]) {

  const result =
    policy.evaluate(request);

  if (
    result.decision !==
    POLICY_DECISIONS.DENY
  ) {
    throw new Error(
      "Malformed request was accepted"
    );
  }
}

console.log("Request validation: PASS");
NODE

echo "11/12 Audit trail"

node <<'NODE'
const {
  ExecutionPolicy
} = require(
  "./src/eons/elite/execution/execution-policy"
);

const policy =
  new ExecutionPolicy();

policy.evaluate({
  requestId: "m13-audit-001",
  operation: "READ_FILE",
  capability: "READ"
});

const audit =
  policy.audit();

if (audit.length !== 1)
  throw new Error(
    "Audit event missing"
  );

if (!audit[0].timestamp)
  throw new Error(
    "Audit timestamp missing"
  );

if (!audit[0].decision)
  throw new Error(
    "Audit decision missing"
  );

console.log("Audit trail: PASS");
NODE

echo "12/12 M12 prerequisite"

bash scripts/eons-tests/m12-execution-regression.sh

echo "M12 prerequisite: PASS"

echo
echo "🧠 M13 EXECUTION POLICY REGRESSION: PASS"
