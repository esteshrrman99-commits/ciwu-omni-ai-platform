'use strict';

const assert =
  require('assert/strict');

const {
  buildCertifiedCandidate,
  routeCertifiedProviders
} = require(
  '../../src/native-workspace/provider-certified-routing-binding-v1'
);

function policyEvidence(
  overrides = {}
) {
  return {
    ok: true,

    route: {
      provider:
        'OPENROUTER',

      model:
        'model-a',

      credential: {
        all_present: true,
        credential_values_exposed:
          false
      },

      policy: {
        network_call_authorized:
          true,

        operational_authority:
          false
      }
    },

    ...overrides
  };
}

function capabilityEvidence(
  overrides = {}
) {
  return {
    ok: true,
    verified: true,

    provider:
      'OPENROUTER',

    model:
      'model-a',

    enabled: true,
    healthy: true,

    capabilities: [
      'chat',
      'reasoning'
    ],

    priority: 10,
    weight: 1,

    ...overrides
  };
}

class MockPolicyRouter {
  constructor(factory) {
    this.factory =
      factory ||
      (() =>
        policyEvidence()
      );

    this.calls = [];
  }

  route(input) {
    this.calls.push(input);

    return this.factory(
      input
    );
  }
}

class MockCapabilityService {
  constructor(factory) {
    this.factory =
      factory ||
      (() =>
        capabilityEvidence()
      );

    this.calls = [];
  }

  evaluate(input) {
    this.calls.push(input);

    return this.factory(
      input
    );
  }
}

function test(name, fn) {
  Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(
        'PASS ' + name
      );
    })
    .catch(error => {
      console.error(
        'FAIL ' + name
      );

      console.error(error);

      process.exitCode = 1;
    });
}

(async () => {

/* 01 */
await (async () => {
  const policy =
    new MockPolicyRouter();

  const capability =
    new MockCapabilityService();

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        policy,

      capabilityService:
        capability,

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    true
  );

  assert.equal(
    result.candidate
      .credential_present,
    true
  );

  assert.equal(
    result.candidate
      .policy_eligible,
    true
  );

  console.log(
    'PASS certified evidence builds candidate'
  );
})();

/* 02 */
await (async () => {
  const policy =
    new MockPolicyRouter();

  const capability =
    new MockCapabilityService();

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        policy,

      capabilityService:
        capability,

      provider:
        'OPENROUTER',

      model:
        'model-a',

      /*
       * These fields deliberately do not exist in API.
       * Caller cannot self-certify eligibility.
       */
      healthy: true,
      credential_present: true,
      policy_eligible: true
    });

  assert.equal(
    result.ok,
    true
  );

  assert.equal(
    result.evidence
      .caller_eligibility_assertions_used,
    false
  );

  console.log(
    'PASS caller eligibility assertions ignored'
  );
})();

/* 03 */
await (async () => {
  const policy =
    new MockPolicyRouter(() =>
      policyEvidence({
        route: {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          credential: {
            all_present: false,
            credential_values_exposed:
              false
          },

          policy: {
            network_call_authorized:
              true,

            operational_authority:
              false
          }
        }
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        policy,

      capabilityService:
        new MockCapabilityService(),

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    true
  );

  assert.equal(
    result.candidate
      .credential_present,
    false
  );

  console.log(
    'PASS credential absence preserved from evidence'
  );
})();

/* 04 */
await (async () => {
  const policy =
    new MockPolicyRouter(() =>
      policyEvidence({
        route: {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          credential: {
            all_present: true,
            credential_values_exposed:
              false
          },

          policy: {
            network_call_authorized:
              true,

            operational_authority:
              true
          }
        }
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        policy,

      capabilityService:
        new MockCapabilityService(),

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.reason,
    'POLICY_AUTHORITY_ESCALATION'
  );

  console.log(
    'PASS policy authority escalation blocked'
  );
})();

/* 05 */
await (async () => {
  const policy =
    new MockPolicyRouter(() =>
      policyEvidence({
        route: {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          credential: {
            all_present: true,
            credential_values_exposed:
              true
          },

          policy: {
            network_call_authorized:
              true,

            operational_authority:
              false
          }
        }
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        policy,

      capabilityService:
        new MockCapabilityService(),

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.reason,
    'CREDENTIAL_BOUNDARY_UNSAFE'
  );

  console.log(
    'PASS credential exposure blocked'
  );
})();

/* 06 */
await (async () => {
  const capability =
    new MockCapabilityService(() =>
      capabilityEvidence({
        healthy: false
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        capability,

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.candidate
      .healthy,
    false
  );

  console.log(
    'PASS health comes from capability evidence'
  );
})();

/* 07 */
await (async () => {
  const capability =
    new MockCapabilityService(() =>
      capabilityEvidence({
        verified: false,
        ok: false
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        capability,

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.reason,
    'CERTIFIED_EVIDENCE_UNVERIFIED'
  );

  console.log(
    'PASS unverified capability evidence denied'
  );
})();

/* 08 */
await (async () => {
  const capability =
    new MockCapabilityService(() =>
      capabilityEvidence({
        provider:
          'OTHER_PROVIDER'
      })
    );

  const result =
    await buildCertifiedCandidate({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        capability,

      provider:
        'OPENROUTER',

      model:
        'model-a'
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.reason,
    'CAPABILITY_PROVIDER_IDENTITY_MISMATCH'
  );

  console.log(
    'PASS capability identity mismatch denied'
  );
})();

/* 09 */
await (async () => {
  const result =
    await routeCertifiedProviders({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        new MockCapabilityService(),

      providers: [
        {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          /*
           * Deliberately malicious caller claims.
           */
          enabled: true,
          healthy: true,
          credential_present: true,
          policy_eligible: true,
          priority: 999999999
        }
      ],

      request: {
        required_capabilities: [
          'chat'
        ]
      }
    });

  assert.equal(
    result.ok,
    true
  );

  assert.equal(
    result.selected.provider,
    'OPENROUTER'
  );

  assert.equal(
    result.selected.priority,
    10
  );

  assert.equal(
    result
      .caller_eligibility_assertions_used,
    false
  );

  console.log(
    'PASS caller score and eligibility injection blocked'
  );
})();

/* 10 */
await (async () => {
  const policy =
    new MockPolicyRouter(() =>
      policyEvidence({
        route: {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          credential: {
            all_present: false,
            credential_values_exposed:
              false
          },

          policy: {
            network_call_authorized:
              true,

            operational_authority:
              false
          }
        }
      })
    );

  const result =
    await routeCertifiedProviders({
      policyRouter:
        policy,

      capabilityService:
        new MockCapabilityService(),

      providers: [
        {
          provider:
            'OPENROUTER',

          model:
            'model-a',

          credential_present:
            true,

          priority:
            999999999
        }
      ]
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.reason,
    'NO_VERIFIED_ELIGIBLE_PROVIDER'
  );

  assert.equal(
    result.rejected[0]
      .failed_gate,
    'CREDENTIAL'
  );

  console.log(
    'PASS missing certified credential cannot be overridden'
  );
})();

/* 11 */
await (async () => {
  const capability =
    new MockCapabilityService(() =>
      capabilityEvidence({
        capabilities: [
          'chat'
        ]
      })
    );

  const result =
    await routeCertifiedProviders({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        capability,

      providers: [
        {
          provider:
            'OPENROUTER',

          model:
            'model-a'
        }
      ],

      request: {
        required_capabilities: [
          'reasoning'
        ]
      }
    });

  assert.equal(
    result.ok,
    false
  );

  assert.equal(
    result.rejected[0]
      .failed_gate,
    'REQUIRED_CAPABILITIES'
  );

  console.log(
    'PASS required capability remains hard gate'
  );
})();

/* 12 */
await (async () => {
  const result =
    await routeCertifiedProviders({
      policyRouter:
        new MockPolicyRouter(),

      capabilityService:
        new MockCapabilityService(),

      providers: [
        {
          provider:
            'OPENROUTER',

          model:
            'model-a'
        }
      ]
    });

  assert.deepEqual(
    result.authority,
    {
      operational: false,
      tool: false,
      mutation: false,
      write: false,
      execute: false,
      commit: false,
      push: false,
      deploy: false
    }
  );

  console.log(
    'PASS binding grants zero consequential authority'
  );
})();

console.log(
  'LEAP023_A2_TESTS=12'
);

console.log(
  'LEAP023_A2_TESTS_PASS=12'
);

console.log(
  'LEAP023_A2_TESTS_FAIL=0'
);

console.log(
  'LEAP023_A2_CERTIFIED_EVIDENCE_BINDING=PASS'
);

})().catch(error => {
  console.error(error);
  process.exit(1);
});
