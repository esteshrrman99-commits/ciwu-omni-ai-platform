'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const secret =
  require(
    '../../src/sovereign/security/secret-envelope'
  );

const onboarding =
  require(
    '../../src/sovereign/provider-runtime/onboarding'
  );

const discovery =
  require(
    '../../src/sovereign/provider-runtime/model-discovery'
  );

const modelTruth =
  require(
    '../../src/sovereign/provider-runtime/model-truth'
  );

const usage =
  require(
    '../../src/sovereign/eons/usage-meter'
  );

const budget =
  require(
    '../../src/sovereign/eons/request-budget'
  );

const retry =
  require(
    '../../src/sovereign/provider-runtime/retry-policy'
  );

const circuit =
  require(
    '../../src/sovereign/provider-runtime/runtime-circuit'
  );

const fallback =
  require(
    '../../src/sovereign/provider-runtime/fallback-v2'
  );

const calibration =
  require(
    '../../src/sovereign/provider-runtime/provider-calibration'
  );

const patch =
  require(
    '../../src/sovereign/codex/patch-contract-v2'
  );

const parser =
  require(
    '../../src/sovereign/codex/model-output-parser'
  );

const xeon =
  require(
    '../../src/sovereign/xeon/sandbox-certification'
  );

const repairEvidence =
  require(
    '../../src/sovereign/xeon/repair-evidence'
  );

const replay =
  require(
    '../../src/sovereign/neurotex/certification-replay'
  );

const promotion =
  require(
    '../../src/sovereign/neurotex/promotion-policy-v2'
  );

const gitIntent =
  require(
    '../../src/sovereign/github/execution-intent'
  );

const mutation =
  require(
    '../../src/sovereign/github/mutation-boundary'
  );

(() => {

  const tmp =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-m504-'
      )
    );

  // WAVE 01
  const desc =
    secret.describe(
      'TEST_SECRET_NOT_REAL'
    );

  assert.equal(
    desc.value,
    '[REDACTED]'
  );

  assert.equal(
    desc.present,
    true
  );

  const onboard =
    onboarding.createRecord({
      provider:
        'groq',
      secret:
        'TEST_SECRET_NOT_REAL',
      model:
        'test-model'
    });

  assert.equal(
    onboard.inferenceCertified,
    false
  );

  assert.equal(
    onboard.costCertified,
    false
  );

  assert.equal(
    onboard.paidAuthorization,
    false
  );

  const meta =
    path.join(
      tmp,
      'provider.json'
    );

  onboarding.saveMetadata(
    meta,
    onboard
  );

  assert.equal(
    fs.existsSync(meta),
    true
  );

  assert.equal(
    fs.readFileSync(
      meta,
      'utf8'
    ).includes(
      'TEST_SECRET_NOT_REAL'
    ),
    false
  );

  // WAVE 02
  const models =
    discovery.normalizeList({
      provider:
        'mock',
      models: [
        'a',
        {id:'b'},
        'a'
      ]
    });

  assert.equal(
    models.length,
    2
  );

  assert.equal(
    discovery
      .summarize(models)
      .inferenceCertifiedCount,
    0
  );

  assert.equal(
    modelTruth.derive({
      discovered: true,
      reachable: true,
      inferenceCertified:
        false,
      costCertified:
        false,
      billingBlocked:
        false
    }),
    'DISCOVERED_NOT_INFERENCE_CERTIFIED'
  );

  // WAVE 03
  const metered =
    usage.normalize({
      provider:
        'mock',
      model:
        'model',
      inputTokens:
        100,
      outputTokens:
        20,
      cachedInputTokens:
        10,
      costUsd:
        0,
      costEvidence:
        'TEST'
    });

  assert.equal(
    metered.totalTokens,
    120
  );

  assert.equal(
    usage
      .requireKnownCost(
        metered
      ).allowed,
    true
  );

  assert.equal(
    budget.authorize({
      monthlySpentUsd:
        99,
      projectedRequestUsd:
        2,
      hardCapUsd:
        100,
      paidAuthorized:
        true,
      costClass:
        'PAID'
    }).allowed,
    false
  );

  assert.equal(
    budget.authorize({
      monthlySpentUsd:
        0,
      projectedRequestUsd:
        0,
      hardCapUsd:
        100,
      paidAuthorized:
        false,
      costClass:
        'ZERO_VERIFIED'
    }).allowed,
    true
  );

  // WAVE 04
  assert.equal(
    retry.classify(
      'RATE_LIMITED'
    ),
    'RETRYABLE'
  );

  assert.equal(
    retry.classify(
      'BILLING_BLOCKED'
    ),
    'NON_RETRYABLE'
  );

  assert.equal(
    retry.delayMs(
      20
    ),
    8000
  );

  const c =
    circuit.create({
      threshold: 2,
      cooldownMs: 1000
    });

  circuit.failure(
    c,
    0
  );

  assert.equal(
    c.state,
    'CLOSED'
  );

  circuit.failure(
    c,
    1
  );

  assert.equal(
    c.state,
    'OPEN'
  );

  assert.equal(
    circuit.mayAttempt(
      c,
      500
    ),
    false
  );

  assert.equal(
    circuit.mayAttempt(
      c,
      1001
    ),
    true
  );

  assert.equal(
    c.state,
    'HALF_OPEN'
  );

  circuit.success(c);

  assert.equal(
    c.state,
    'CLOSED'
  );

  // WAVE 05
  const candidates = [
    {
      id:
        'free-b',

      certified:
        true,

      costClass:
        'ZERO_VERIFIED',

      available:
        true,

      circuitOpen:
        false,

      quality:
        0.8,

      reliability:
        1,

      latency:
        0.1,

      cost:
        0,

      evidence:
        1
    },
    {
      id:
        'free-a',

      certified:
        true,

      costClass:
        'ZERO_VERIFIED',

      available:
        true,

      circuitOpen:
        false,

      quality:
        1,

      reliability:
        1,

      latency:
        0,

      cost:
        0,

      evidence:
        1
    },
    {
      id:
        'paid',

      certified:
        true,

      costClass:
        'PAID',

      available:
        true,

      circuitOpen:
        false,

      quality:
        1,

      reliability:
        1,

      latency:
        0,

      cost:
        0,

      evidence:
        1
    }
  ];

  assert.equal(
    fallback
      .next({
        candidates,
        attempted: []
      }).id,
    'free-a'
  );

  assert.equal(
    fallback
      .next({
        candidates,
        attempted:
          ['free-a']
      }).id,
    'free-b'
  );

  const calibrated =
    calibration.calibrate({
      accuracy:
        0.9,
      successRate:
        0.8,
      latencyScore:
        0.75,
      evidenceConfidence:
        0.95
    });

  assert.equal(
    calibrated.cost,
    0
  );

  // WAVE 06
  assert.equal(
    patch.safeRelativePath(
      'src/test.js'
    ),
    true
  );

  assert.equal(
    patch.safeRelativePath(
      '../secret'
    ),
    false
  );

  const parsed =
    parser.parse(
      JSON.stringify({
        operations: [
          {
            type:
              'replace',
            file:
              'src/test.js',
            before:
              'old',
            after:
              'new'
          }
        ]
      })
    );

  assert.equal(
    parsed.operations.length,
    1
  );

  // WAVE 07
  const cert =
    xeon.certify({
      workspaceIsTemporary:
        true,
      productionPathTouched:
        false,
      syntaxPassed:
        true,
      testsPassed:
        true,
      patchValidated:
        true,
      cleanupConfirmed:
        true
    });

  assert.equal(
    cert.certified,
    true
  );

  const evidence =
    repairEvidence.build({
      task:
        'repair',
      before:
        'a',
      after:
        'b',
      testOutput:
        'PASS',
      certification:
        cert
    });

  assert.equal(
    evidence
      .certification
      .certified,
    true
  );

  // WAVE 08
  const replayRecord =
    replay.record({
      repairEvidence:
        evidence,
      promotedFact: {
        fact:
          'repair passed'
      }
    });

  assert.equal(
    replay.replay({
      replayRecord,
      repairEvidence:
        evidence
    }).valid,
    true
  );

  assert.equal(
    promotion.authorize({
      repairCertified:
        true,
      evidenceReplayValid:
        true,
      confidence:
        0.9,
      humanApprovalRequired:
        false,
      humanApproved:
        false
    }).allowed,
    true
  );

  // WAVE 09
  const intent =
    gitIntent.create({
      proposalId:
        'proposal-1',
      operation:
        'PUSH',
      repository:
        'repo',
      baseCommit:
        'abc123'
    });

  assert.equal(
    gitIntent
      .mayExecute(
        intent
      ),
    false
  );

  const approved =
    gitIntent.approve(
      intent
    );

  assert.equal(
    gitIntent
      .mayExecute(
        approved
      ),
    true
  );

  assert.equal(
    mutation.assertSafe(),
    true
  );

  assert.equal(
    mutation
      .BOUNDARY
      .forcePush,
    false
  );

  assert.equal(
    mutation
      .BOUNDARY
      .autonomousPush,
    false
  );

  // WAVE 10
  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m385-m504.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    385
  );

  assert.equal(
    ledger.milestoneEnd,
    504
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
    ledger.realProviderCallsDuringBuild,
    false
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

  assert.equal(
    ledger.nativeFoundationModel,
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
    'CIWU_OMEGA120_M385_M504_TESTS_PASS'
  );
})();
