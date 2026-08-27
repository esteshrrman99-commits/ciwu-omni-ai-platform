#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M12 EXECUTION REGRESSION"

echo "1/10 Node availability"
node --version
echo "Node: PASS"

echo "2/10 Adapter syntax"
node --check \
  src/eons/elite/execution/execution-adapter.js
echo "Syntax: PASS"

echo "3/10 Adapter loading"

node <<'NODE'
const {
  ExecutionAdapter,
  OPERATIONS
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

if (!ExecutionAdapter)
  throw new Error("ExecutionAdapter missing");

if (!OPERATIONS.READ_FILE)
  throw new Error("Operation inventory missing");

console.log("Adapter load: PASS");
NODE

echo "4/10 READ execution"

node <<'NODE'
const {
  ExecutionAdapter
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

const adapter =
  new ExecutionAdapter({
    root: process.cwd()
  });

const result =
  adapter.execute({
    capability: "READ",
    operation: "READ_FILE",
    target:
      "src/eons/elite/execution/capability-broker.js"
  });

if (!result.success)
  throw new Error(
    `READ failed: ${result.error}`
  );

console.log("READ execution: PASS");
NODE

echo "5/10 WRITE boundary"

node <<'NODE'
const {
  ExecutionAdapter
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

const adapter =
  new ExecutionAdapter({
    root: process.cwd()
  });

let blocked = false;

try {
  adapter.execute({
    capability: "WRITE",
    operation: "WRITE_FILE",
    target: "../outside-eons-test.txt",
    content: "blocked"
  });
} catch (error) {
  blocked = true;
}

if (!blocked)
  throw new Error(
    "Path escape was not blocked"
  );

console.log("WRITE path boundary: PASS");
NODE

echo "6/10 TEST execution"

node <<'NODE'
const {
  ExecutionAdapter
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

const adapter =
  new ExecutionAdapter({
    root: process.cwd()
  });

const result =
  adapter.execute({
    capability: "TEST",
    operation: "NODE_CHECK",
    target:
      "src/eons/elite/execution/capability-broker.js"
  });

if (!result.success)
  throw new Error(
    `TEST failed: ${result.error}`
  );

console.log("TEST execution: PASS");
NODE

echo "7/10 Dry-run"

node <<'NODE'
const {
  ExecutionAdapter
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

const adapter =
  new ExecutionAdapter({
    root: process.cwd(),
    dryRun: true
  });

const result =
  adapter.execute({
    capability: "READ",
    operation: "READ_FILE",
    target:
      "src/eons/elite/execution/capability-broker.js"
  });

if (!result.dryRun)
  throw new Error(
    "Dry-run flag missing"
  );

if (!result.success)
  throw new Error(
    "Dry-run failed"
  );

console.log("Dry-run execution: PASS");
NODE

echo "8/10 Unauthorized capability"

node <<'NODE'
const {
  ExecutionAdapter
} = require(
  "./src/eons/elite/execution/execution-adapter"
);

const adapter =
  new ExecutionAdapter({
    root: process.cwd()
  });

let blocked = false;

try {
  adapter.execute({
    capability: "WRITE",
    operation: "WRITE_FILE",
    target:
      "scripts/eons-tests/m12-unauthorized.txt",
    content: "blocked"
  });
} catch (error) {
  blocked = true;
}

if (!blocked)
  throw new Error(
    "Unauthorized WRITE was not blocked"
  );

console.log("Capability gate: PASS");
NODE

echo "9/10 M11 regression"

bash scripts/eons-tests/m11-execution-regression.sh

echo "M11 prerequisite: PASS"

echo "10/10 M10 regression"

bash scripts/eons-tests/m10-elite-regression.sh

echo
echo "🧠 M12 EXECUTION REGRESSION: PASS"
