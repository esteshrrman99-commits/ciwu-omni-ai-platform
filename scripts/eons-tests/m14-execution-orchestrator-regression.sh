#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "🧠 EONS ELITE M14 EXECUTION ORCHESTRATOR REGRESSION"

echo "1/15 Node availability"
node --version
echo "Node: PASS"

echo "2/15 Orchestrator syntax"
node --check \
  src/eons/elite/execution/execution-orchestrator.js
echo "Syntax: PASS"

echo "3/15 Regression script syntax protection"
bash -n \
  scripts/eons-tests/m14-execution-orchestrator-regression.sh
echo "Regression shell syntax: PASS"

echo "4/15 Orchestrator loading"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

if (typeof ExecutionOrchestrator !== "function") {
  throw new Error("ExecutionOrchestrator missing");
}

console.log("Orchestrator load: PASS");
NODE

echo "5/15 Safe READ reaches adapter"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute(request) {
    calls += 1;
    return {
      ok: true,
      operation: request.operation
    };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    requestId: "m14-read-001",
    operation: "READ_FILE",
    capability: "READ",
    target: "README.md"
  });

if (calls !== 1) {
  throw new Error("Authorized READ did not reach adapter");
}

if (result.executed !== true) {
  throw new Error("Authorized READ was not executed");
}

if (result.verified !== true) {
  throw new Error("Authorized READ was not verified");
}

console.log("Authorized READ execution: PASS");
NODE

echo "6/15 WRITE approval boundary"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute() {
    calls += 1;
    return { ok: true };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    requestId: "m14-write-001",
    operation: "WRITE_FILE",
    capability: "WRITE",
    target: "example.txt"
  });

if (calls !== 0) {
  throw new Error("Unapproved WRITE bypassed policy");
}

if (result.executed === true) {
  throw new Error("Unapproved WRITE executed");
}

console.log("WRITE approval boundary: PASS");
NODE

echo "7/15 Approved WRITE reaches adapter"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute(request) {
    calls += 1;
    return {
      ok: true,
      operation: request.operation
    };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    requestId: "m14-write-002",
    operation: "WRITE_FILE",
    capability: "WRITE",
    target: "example.txt",
    approved: true
  });

if (calls !== 1) {
  throw new Error("Approved WRITE did not reach adapter");
}

if (result.executed !== true) {
  throw new Error("Approved WRITE was not executed");
}

if (result.verified !== true) {
  throw new Error("Approved WRITE was not verified");
}

console.log("Approved WRITE execution: PASS");
NODE

echo "8/15 Dangerous capability never reaches adapter"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute() {
    calls += 1;
    return { ok: true };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

for (const capability of [
  "PUSH",
  "DEPLOY",
  "NETWORK",
  "CREDENTIALS"
]) {
  const result =
    orchestrator.execute({
      requestId: `m14-danger-${capability}`,
      operation: "READ_FILE",
      capability
    });

  if (result.executed === true) {
    throw new Error(
      `${capability} reached execution`
    );
  }
}

if (calls !== 0) {
  throw new Error(
    "Dangerous capability bypassed M13"
  );
}

console.log("Dangerous capability containment: PASS");
NODE

echo "9/15 Capability mismatch cannot execute"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute() {
    calls += 1;
    return { ok: true };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    requestId: "m14-mismatch-001",
    operation: "READ_FILE",
    capability: "WRITE"
  });

if (calls !== 0) {
  throw new Error(
    "Capability mismatch reached adapter"
  );
}

if (result.executed === true) {
  throw new Error(
    "Capability mismatch executed"
  );
}

console.log("Capability mismatch containment: PASS");
NODE

echo "10/15 Missing request ID cannot execute"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

let calls = 0;

const adapter = {
  execute() {
    calls += 1;
    return { ok: true };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    operation: "READ_FILE",
    capability: "READ"
  });

if (calls !== 0) {
  throw new Error(
    "Malformed request reached adapter"
  );
}

if (result.executed === true) {
  throw new Error(
    "Malformed request executed"
  );
}

console.log("Request validation boundary: PASS");
NODE

echo "11/15 Adapter failure containment"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

const adapter = {
  execute() {
    throw new Error("controlled adapter failure");
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

const result =
  orchestrator.execute({
    requestId: "m14-error-001",
    operation: "READ_FILE",
    capability: "READ"
  });

if (result.executed === true) {
  throw new Error(
    "Adapter failure reported as successful execution"
  );
}

if (result.verified === true) {
  throw new Error(
    "Adapter failure reported as verified"
  );
}

console.log("Adapter failure containment: PASS");
NODE

echo "12/15 Audit chain"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

const adapter = {
  execute() {
    return {
      ok: true
    };
  }
};

const orchestrator =
  new ExecutionOrchestrator({ adapter });

orchestrator.execute({
  requestId: "m14-audit-001",
  operation: "READ_FILE",
  capability: "READ"
});

const audit =
  orchestrator.audit();

if (audit.length < 2) {
  throw new Error(
    "Expected policy and orchestrator audit events"
  );
}

if (!audit.some(
  event => event.phase === "POLICY"
)) {
  throw new Error(
    "Policy audit event missing"
  );
}

if (!audit.some(
  event => event.phase === "VERIFY"
)) {
  throw new Error(
    "Verification audit event missing"
  );
}

console.log("Audit chain: PASS");
NODE

echo "13/15 Adapter contract failure containment"
node <<'NODE'
const {
  ExecutionOrchestrator
} = require(
  "./src/eons/elite/execution/execution-orchestrator"
);

const orchestrator =
  new ExecutionOrchestrator({
    adapter: {}
  });

const result =
  orchestrator.execute({
    requestId: "m14-contract-001",
    operation: "READ_FILE",
    capability: "READ"
  });

if (result.executed === true) {
  throw new Error(
    "Invalid adapter contract executed"
  );
}

console.log("Adapter contract containment: PASS");
NODE

echo "14/15 M13 prerequisite"
bash scripts/eons-tests/m13-execution-policy-regression.sh
echo "M13 prerequisite: PASS"

echo "15/15 M12 prerequisite"
bash scripts/eons-tests/m12-execution-regression.sh
echo "M12 prerequisite: PASS"

echo
echo "============================================================"
echo "🧠 M14 EXECUTION ORCHESTRATOR REGRESSION: PASS"
echo "============================================================"
