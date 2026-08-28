'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const policy =
  require(
    '../../src/sovereign/provider-runtime/certification-policy'
  );

const truth =
  require(
    '../../src/sovereign/provider-runtime/truth-state'
  );

const prices =
  require(
    '../../src/sovereign/eons/price-registry'
  );

const budget =
  require(
    '../../src/sovereign/eons/budget-ledger-v2'
  );

const providerScore =
  require(
    '../../src/sovereign/eons/provider-score'
  );

const routing =
  require(
    '../../src/sovereign/provider-runtime/routing-policy'
  );

const tournament =
  require(
    '../../src/sovereign/evaluation/tournament'
  );

const calibration =
  require(
    '../../src/sovereign/evaluation/calibration'
  );

const repairPlan =
  require(
    '../../src/sovereign/codex/repair-plan'
  );

const repairPipeline =
  require(
    '../../src/sovereign/codex/repair-pipeline'
  );

const learningPolicy =
  require(
    '../../src/sovereign/neurotex/learning-policy'
  );

const learning =
  require(
    '../../src/sovereign/neurotex/certified-learning'
  );

const dependency =
  require(
    '../../src/sovereign/project-brain/dependency-graph-v2'
  );

const approval =
  require(
    '../../src/sovereign/github/approval-gate'
  );

const githubPolicy =
  require(
    '../../src/sovereign/github/execution-policy'
  );

const localManifest =
  require(
    '../../src/sovereign/local-model/manifest'
  );

const localPolicy =
  require(
    '../../src/sovereign/local-model/policy'
  );

(async () => {

  const tmp =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-m384-'
      )
    );

  // --------------------------------------------------------------
  // Provider certification policy
  // --------------------------------------------------------------

  assert.equal(
    policy.evaluate({
      configured: true,
      realInferenceAuthorized:
        false,
      paidInferenceAuthorized:
        false,
      costClass:
        'ZERO_VERIFIED',
      priceEvidenceFresh:
        true,
      providerCertified:
        false
    }).allowed,
    false
  );

  assert.equal(
    policy.evaluate({
      configured: true,
      realInferenceAuthorized:
        true,
      paidInferenceAuthorized:
        false,
      costClass:
        'UNKNOWN',
      priceEvidenceFresh:
        true,
      providerCertified:
        false
    }).allowed,
    false
  );

  assert.equal(
    policy.evaluate({
      configured: true,
      realInferenceAuthorized:
        true,
      paidInferenceAuthorized:
        false,
      costClass:
        'ZERO_VERIFIED',
      priceEvidenceFresh:
        true,
      providerCertified:
        false
    }).allowed,
    true
  );

  // --------------------------------------------------------------
  // Truth states
  // --------------------------------------------------------------

  assert.equal(
    truth.derive({
      configured: false
    }),
    'UNCONFIGURED'
  );

  assert.equal(
    truth.derive({
      configured: true,
      billingBlocked: true
    }),
    'BILLING_BLOCKED'
  );

  assert.equal(
    truth.derive({
      configured: true,
      reachable: true,
      priceVerified: true,
      inferenceCertified: true
    }),
    'CERTIFIED_AVAILABLE'
  );

  // --------------------------------------------------------------
  // Price registry
  // --------------------------------------------------------------

  const priceFile =
    path.join(
      tmp,
      'prices.json'
    );

  prices.save(
    priceFile,
    [
      {
        provider:
          'mock',
        model:
          'mock-model',
        costClass:
          'ZERO_VERIFIED',
        source:
          'unit-test',
        lastVerifiedAt:
          new Date()
            .toISOString()
      }
    ]
  );

  assert.equal(
    prices.load(
      priceFile
    ).length,
    1
  );

  assert.equal(
    prices.isFresh(
      prices.load(
        priceFile
      )[0]
    ),
    true
  );

  // --------------------------------------------------------------
  // Budget ledger
  // --------------------------------------------------------------

  const budgetFile =
    path.join(
      tmp,
      'budget.jsonl'
    );

  budget.append(
    budgetFile,
    {
      provider:
        'mock',
      model:
        'mock',
      amountUsd:
        0,
      source:
        'unit-test'
    }
  );

  assert.equal(
    budget.records(
      budgetFile
    ).length,
    1
  );

  assert.equal(
    budget.remaining({
      spentUsd: 25,
      capUsd: 100
    }),
    75
  );

  // --------------------------------------------------------------
  // EONS scoring / routing
  // --------------------------------------------------------------

  const score =
    providerScore.score({
      quality: 1,
      reliability: 1,
      latency: 0,
      cost: 0,
      evidence: 1,
      certified: true
    });

  assert.equal(
    score,
    1
  );

  const chosen =
    routing.select(
      [
        {
          id: 'paid',
          certified: true,
          costClass:
            'PAID',
          projectedCostUsd:
            1,
          quality: 1,
          reliability: 1,
          latency: 0,
          cost: 0.1,
          evidence: 1
        },
        {
          id: 'free',
          certified: true,
          costClass:
            'ZERO_VERIFIED',
          projectedCostUsd:
            0,
          quality: 0.8,
          reliability: 1,
          latency: 0,
          cost: 0,
          evidence: 1
        }
      ],
      {
        remainingBudgetUsd:
          100,
        paidAuthorized:
          false
      }
    );

  assert.equal(
    chosen.id,
    'free'
  );

  // --------------------------------------------------------------
  // Tournament
  // --------------------------------------------------------------

  const providers =
    [
      { id: 'a' },
      { id: 'b' }
    ];

  const tasks =
    [
      {
        id: 'x',
        validate:
          x => x === 'PASS'
      }
    ];

  const result =
    await tournament.run({
      providers,
      tasks,
      invoke:
        async () =>
          'PASS'
    });

  assert.equal(
    result.providers.length,
    2
  );

  assert.equal(
    result.providers[0]
      .summary.accuracy,
    1
  );

  assert.equal(
    calibration.reliability(
      [true,true,false,true]
    ),
    0.75
  );

  // --------------------------------------------------------------
  // CODEX / XEON
  // --------------------------------------------------------------

  const plan =
    repairPlan.build({
      task:
        'repair test',
      evidence:
        ['source:a'],
      diagnostics:
        ['failure:a']
    });

  assert.equal(
    plan.outputContract
      .productionMutation,
    false
  );

  assert.equal(
    typeof repairPipeline
      .execute,
    'function'
  );

  // --------------------------------------------------------------
  // Neurotex
  // --------------------------------------------------------------

  assert.equal(
    learningPolicy
      .mayPromote({
        testsPassed:
          true,
        provenancePresent:
          true,
        evidenceValid:
          true,
        authorizationValid:
          true
      }),
    true
  );

  const fakeMemory = {
    rememberCertification(
      record
    ) {
      return {
        id:
          'memory-1',
        ...record
      };
    }
  };

  const promoted =
    learning.promote({
      memory:
        fakeMemory,

      candidate: {
        content:
          'validated repair',
        provenance:
          'unit-test',
        confidence:
          1
      },

      testsPassed:
        true,

      evidenceValid:
        true,

      authorizationValid:
        true
    });

  assert.equal(
    promoted.promoted,
    true
  );

  // --------------------------------------------------------------
  // Dependency graph
  // --------------------------------------------------------------

  const graph =
    dependency.build(
      [
        {
          from:
            'a.js',
          to:
            'b.js'
        },
        {
          from:
            'b.js',
          to:
            'c.js'
        }
      ]
    );

  const impacted =
    dependency.impacted(
      graph,
      ['c.js']
    );

  assert.ok(
    impacted.includes(
      'a.js'
    )
  );

  assert.ok(
    impacted.includes(
      'b.js'
    )
  );

  // --------------------------------------------------------------
  // GitHub approval
  // --------------------------------------------------------------

  const issued =
    approval.issue({
      proposalId:
        'proposal-1',
      operation:
        'PUSH',
      ttlMs:
        60000
    });

  assert.equal(
    approval.verify({
      approval:
        issued,
      token:
        issued.token,
      proposalId:
        'proposal-1',
      operation:
        'PUSH'
    }),
    true
  );

  assert.equal(
    approval.verify({
      approval:
        issued,
      token:
        issued.token,
      proposalId:
        'wrong',
      operation:
        'PUSH'
    }),
    false
  );

  assert.equal(
    githubPolicy
      .POLICY.forcePush,
    false
  );

  // --------------------------------------------------------------
  // Local model substrate
  // --------------------------------------------------------------

  const manifest = {
    id:
      'mock-local-model',

    runtime:
      'mock',

    license:
      'test-license',

    weightsControlled:
      false,

    networkRequired:
      false,

    nativeFoundationModel:
      false
  };

  assert.equal(
    localManifest
      .validate(
        manifest
      ),
    true
  );

  assert.equal(
    localManifest
      .capability(
        manifest
      )
      .nativeFoundationModel,
    false
  );

  assert.equal(
    localPolicy
      .canRun({
        manifest,
        executionEnvironment:
          'ISOLATED',
        memoryRequirementMb:
          100,
        availableMemoryMb:
          200
      }).allowed,
    true
  );

  // --------------------------------------------------------------
  // Ledger
  // --------------------------------------------------------------

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m265-m384.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    265
  );

  assert.equal(
    ledger.milestoneEnd,
    384
  );

  assert.equal(
    ledger.milestoneCount,
    120
  );

  assert.equal(
    ledger.waves,
    10
  );

  assert.equal(
    ledger.milestonesPerWave,
    12
  );

  assert.equal(
    ledger.monthlyRequiredSpendUsd,
    0
  );

  assert.equal(
    ledger.monthlyHardCapUsd,
    100
  );

  assert.equal(
    ledger.realInferenceDefault,
    false
  );

  assert.equal(
    ledger.paidInferenceDefault,
    false
  );

  assert.equal(
    ledger.autonomousGitPush,
    false
  );

  assert.equal(
    ledger.forcePush,
    false
  );

  fs.rmSync(
    tmp,
    {
      recursive: true,
      force: true
    }
  );

  console.log(
    'CIWU_OMEGA120_M265_M384_TESTS_PASS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
