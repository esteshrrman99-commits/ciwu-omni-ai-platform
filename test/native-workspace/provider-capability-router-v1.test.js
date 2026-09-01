'use strict';

const assert =
  require('assert/strict');

const {
  HARD_GATE_ORDER,
  evaluateEligibility,
  routeProvider
} = require(
  '../../src/native-workspace/provider-capability-router-v1'
);

function valid(overrides = {}) {
  return {
    provider: 'OPENROUTER',
    model: 'model-a',

    enabled: true,
    healthy: true,

    credential_required: true,
    credential_present: true,

    network_allowed: true,
    policy_eligible: true,

    operational_authority: false,
    tool_authority: false,
    mutation_authority: false,
    write_authority: false,
    execute_authority: false,
    commit_authority: false,
    push_authority: false,
    deploy_authority: false,

    capabilities: [
      'chat',
      'reasoning'
    ],

    priority: 10,
    weight: 1,

    ...overrides
  };
}

function test(
  name,
  fn
) {
  try {
    fn();

    console.log(
      'PASS ' + name
    );
  } catch (error) {
    console.error(
      'FAIL ' + name
    );

    throw error;
  }
}

/* 01 */
test(
  'hard gate order is fixed and deterministic',
  () => {
    assert.deepEqual(
      HARD_GATE_ORDER,
      [
        'SCHEMA',
        'ENABLED',
        'HEALTH',
        'CREDENTIAL',
        'NETWORK',
        'POLICY',
        'AUTHORITY',
        'REQUIRED_CAPABILITIES'
      ]
    );
  }
);

/* 02 */
test(
  'valid provider becomes eligible',
  () => {
    const result =
      evaluateEligibility(
        valid(),
        {
          required_capabilities: [
            'chat'
          ]
        }
      );

    assert.equal(
      result.eligible,
      true
    );
  }
);

/* 03 */
test(
  'disabled high-score provider cannot win',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            provider: 'BAD',
            model: 'super-model',
            enabled: false,
            priority: 999999,
            weight: 999999
          }),

          valid({
            provider: 'GOOD',
            model: 'safe-model',
            priority: 1,
            weight: 0
          })
        ]
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.selected.provider,
      'GOOD'
    );

    assert.equal(
      result.rejected[0]
        .failed_gate,
      'ENABLED'
    );
  }
);

/* 04 */
test(
  'missing credential cannot be rescued by score',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            provider: 'NO-CRED',
            credential_present: false,
            priority: 100000
          }),

          valid({
            provider: 'VERIFIED',
            priority: 1
          })
        ]
      });

    assert.equal(
      result.selected.provider,
      'VERIFIED'
    );

    assert.equal(
      result.rejected[0]
        .failed_gate,
      'CREDENTIAL'
    );
  }
);

/* 05 */
test(
  'network denied provider is ineligible',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            network_allowed: false
          })
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
      'NETWORK'
    );
  }
);

/* 06 */
test(
  'unverified policy state fails closed',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            policy_eligible:
              undefined
          })
        ]
      });

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      result.rejected[0]
        .failed_gate,
      'POLICY'
    );
  }
);

/* 07 */
test(
  'provider cannot self-grant authority',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            tool_authority: true,
            priority: 999999
          })
        ]
      });

    assert.equal(
      result.ok,
      false
    );

    assert.equal(
      result.rejected[0]
        .failed_gate,
      'AUTHORITY'
    );
  }
);

/* 08 */
test(
  'required capability is a hard gate',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            capabilities: [
              'chat'
            ]
          })
        ],

        request: {
          required_capabilities: [
            'chat',
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

    assert.deepEqual(
      result.rejected[0]
        .missing_capabilities,
      ['reasoning']
    );
  }
);

/* 09 */
test(
  'priority ranks only already eligible providers',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            provider: 'LOW',
            priority: 1
          }),

          valid({
            provider: 'HIGH',
            priority: 2
          })
        ]
      });

    assert.equal(
      result.selected.provider,
      'HIGH'
    );
  }
);

/* 10 */
test(
  'preferred capability refines eligible selection',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid({
            provider: 'CHAT',
            priority: 5,
            capabilities: [
              'chat'
            ]
          }),

          valid({
            provider: 'CODE',
            priority: 5,
            capabilities: [
              'chat',
              'code'
            ]
          })
        ],

        request: {
          preferred_capabilities: [
            'code'
          ]
        }
      });

    assert.equal(
      result.selected.provider,
      'CODE'
    );
  }
);

/* 11 */
test(
  'lexical provider tie-break is deterministic',
  () => {
    const candidates = [
      valid({
        provider: 'ZETA',
        model: 'same',
        priority: 3,
        weight: 1
      }),

      valid({
        provider: 'ALPHA',
        model: 'same',
        priority: 3,
        weight: 1
      })
    ];

    const first =
      routeProvider({
        candidates
      });

    const second =
      routeProvider({
        candidates:
          [...candidates].reverse()
      });

    assert.equal(
      first.selected.provider,
      'ALPHA'
    );

    assert.deepEqual(
      first.selected,
      second.selected
    );
  }
);

/* 12 */
test(
  'route result grants zero consequential authority',
  () => {
    const result =
      routeProvider({
        candidates: [
          valid()
        ]
      });

    assert.equal(
      result.ok,
      true
    );

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
  }
);

console.log(
  'LEAP023_A1_TESTS=12'
);

console.log(
  'LEAP023_A1_TESTS_PASS=12'
);

console.log(
  'LEAP023_A1_TESTS_FAIL=0'
);

console.log(
  'LEAP023_A1_DETERMINISTIC_ROUTER=PASS'
);
