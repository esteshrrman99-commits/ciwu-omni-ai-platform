"use strict";

/*

* EONS ELITE M11
* CONTROLLED EXECUTION FABRIC
*
* Execution is capability-based.
*
* The broker does NOT provide unrestricted shell access.
*
* Capabilities:
*
* READ
* WRITE
* TEST
* GIT
* PUSH
* DEPLOY
* NETWORK
* CREDENTIALS
*
* Each capability must be explicitly enabled.
*
* Dangerous capabilities remain disabled by default.
  */

const CAPABILITIES = Object.freeze([
"READ",
"WRITE",
"TEST",
"GIT",
"PUSH",
"DEPLOY",
"NETWORK",
"CREDENTIALS"
]);

const DEFAULT_POLICY = Object.freeze({
READ: true,
WRITE: false,
TEST: true,
GIT: false,
PUSH: false,
DEPLOY: false,
NETWORK: false,
CREDENTIALS: false
});

class CapabilityBroker {
constructor(options = {}) {
this.policy = {
...DEFAULT_POLICY,
...(options.policy || {})
};

this.auditLog = [];

}

capabilities() {
return [...CAPABILITIES];
}

enabled(capability) {
this.assertCapability(capability);

return this.policy[capability] === true;

}

assertCapability(capability) {
if (!CAPABILITIES.includes(capability)) {
throw new Error(
"Unknown execution capability: ${capability}"
);
}
}

authorize(capability, operation = "UNSPECIFIED") {
this.assertCapability(capability);

const allowed =
  this.policy[capability] === true;

const event = {
  timestamp: new Date().toISOString(),
  capability,
  operation,
  allowed
};

this.auditLog.push(event);

if (!allowed) {
  throw new Error(
    `Execution capability denied: ${capability}`
  );
}

return event;

}

audit() {
return [...this.auditLog];
}

policySnapshot() {
return { ...this.policy };
}
}

module.exports = {
CAPABILITIES,
DEFAULT_POLICY,
CapabilityBroker
};
