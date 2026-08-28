'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const aging =
  require(
    '../../src/sovereign/provider-runtime/evidence-aging-v2'
  );

const budget =
  require(
    '../../src/sovereign/budget/reservation-governor-v2'
  );

const memory =
  require(
    '../../src/sovereign/provider-runtime/failure-memory-v1'
  );

const decision =
  require(
    '../../src/sovereign/runtime/decision-envelope-v2'
  );

const traceModule =
  require(
    '../../src/sovereign/m3/decision-trace-v3'
  );

const executionPlan =
  require(
    '../../src/sovereign/federation/execution-plan-v2'
  );

const promotion =
  require(
    '../../src/sovereign/codex/promotion-gate-v3'
  );

const learning =
  require(
    '../../src/sovereign/neurotex/outcome-learning-v7'
  );

const admission =
  require(
    '../../src/sovereign/runtime/admission-composite-v7'
  );

const fresh =
  aging.assess({
    issuedAt:
      '2026-01-01T00:00:00Z',

    now:
      '2026-01-01T00:00:01Z',

    ttlMs:
      2000
  });

assert.equal(
  fresh.valid,
  true
);

assert.equal(
  fresh.stale,
  false
);

const expired =
  aging.assess({
    issuedAt:
      '2026-01-01T00:00:00Z',

    now:
      '2026-01-01T00:00:02Z',

    ttlMs:
      2000
  });

assert.equal(
  expired.valid,
  false
);

assert.equal(
  expired.reason,
  'EVIDENCE_EXPIRED'
);

const governor =
  budget.create({
    monthlyHardCapUsd:
      100
  });

const zero =
  governor.reserve({
    estimatedCostUsd:
      0
  });

assert.equal(
  zero.allowed,
  true
);

const unauthorizedPaid =
  governor.reserve({
    estimatedCostUsd:
      1
  });

assert.equal(
  unauthorizedPaid.allowed,
  false
);

assert.equal(
  unauthorizedPaid.reason,
  'PAID_AUTHORIZATION_REQUIRED'
);

const paid =
  governor.reserve({
    estimatedCostUsd:
      5,
    paidAuthorization:
      true
  });

assert.equal(
  paid.allowed,
  true
);

assert.equal(
  governor.snapshot().reservedUsd,
  5
);

governor.settle({
  reservedUsd:
    5,

  observedCostUsd:
    4.25
});

assert.equal(
  governor.snapshot().spentUsd,
  4.25
);

const failureMemory =
  memory.create({
    circuitThreshold:
      2
  });

failureMemory.recordFailure(
  'TIMEOUT'
);

assert.equal(
  failureMemory.snapshot()
    .circuitOpen,
  false
);

failureMemory.recordFailure(
  'TIMEOUT'
);

assert.equal(
  failureMemory.snapshot()
    .circuitOpen,
  true
);

assert.equal(
  failureMemory.halfOpen(),
  true
);

const envelope =
  decision.create({
    taskClass:
      'CODE',

    provider:
      'fixture',

    model:
      'fixture-model',

    eonsScore:
      0.8,

    evidenceHash:
      'evidence',

    budgetStateHash:
      'budget',

    fallbackRank:
      1,

    authorizationState:
      'VALID',

    selected:
      true
  });

assert.equal(
  decision.verify(
    envelope
  ),
  true
);

const trace =
  traceModule.create({
    requestId:
      'req-1',

    taskClass:
      'CODE',

    candidates:[
      {
        provider:'a',
        model:'a1'
      }
    ]
  });

trace.record({
  type:
    'CANDIDATES_ADMITTED',

  detail:{
    count:1
  }
});

trace.record({
  type:
    'PROVIDER_SELECTED',

  detail:{
    provider:'a'
  }
});

const finished =
  trace.finish({
    selectedProvider:'a',
    selectedModel:'a1'
  });

assert.equal(
  finished.events.length,
  2
);

assert.equal(
  finished.abstained,
  false
);

const ranked = [
  {
    entry:{
      provider:'a',
      model:'a1',
      runtimeEligible:true
    },

    evaluation:{
      score:0.9
    }
  },

  {
    entry:{
      provider:'b',
      model:'b1',
      runtimeEligible:true
    },

    evaluation:{
      score:0.8
    }
  }
];

const plan =
  executionPlan.build({
    rankedProviders:
      ranked,

    maximumAttempts:
      2
  });

assert.equal(
  plan.executable,
  true
);

assert.equal(
  plan.attempts.length,
  2
);

assert.equal(
  plan.attempts[0].attempt,
  1
);

const gate =
  promotion.evaluate({
    patchHash:
      'patch',

    syntaxPassed:
      true,

    unitTestsPassed:
      true,

    regressionsPassed:
      true,

    sandboxCertified:
      true,

    providerEvidenceValid:
      true,

    humanApproval:
      false
  });

assert.equal(
  gate.technicallyCertified,
  true
);

assert.equal(
  gate.productionPromotionAuthorized,
  false
);

const learnedSuccess =
  learning.update({
    priorScore:
      0.5,

    observedSuccess:
      true,

    evidenceConfidence:
      1,

    learningRate:
      0.2
  });

assert.ok(
  learnedSuccess.posterior >
  0.5
);

const learnedFailure =
  learning.update({
    priorScore:
      0.5,

    observedSuccess:
      false,

    evidenceConfidence:
      1,

    learningRate:
      0.2
  });

assert.ok(
  learnedFailure.posterior <
  0.5
);

const admitted =
  admission.assess({
    providerState:
      'RUNTIME_ELIGIBLE',

    evidenceFresh:
      true,

    priceFresh:
      true,

    benchmarkFresh:
      true,

    receiptValid:
      true,

    budgetAllowed:
      true,

    circuitOpen:
      false,

    revocationPresent:
      false,

    authorizationValid:
      true
  });

assert.equal(
  admitted.admitted,
  true
);

const blocked =
  admission.assess({
    providerState:
      'RUNTIME_ELIGIBLE',

    evidenceFresh:
      true,

    priceFresh:
      true,

    benchmarkFresh:
      true,

    receiptValid:
      true,

    budgetAllowed:
      false,

    circuitOpen:
      false,

    revocationPresent:
      false,

    authorizationValid:
      true
  });

assert.equal(
  blocked.admitted,
  false
);

assert.ok(
  blocked.failures.includes(
    'BUDGET_NOT_AUTHORIZED'
  )
);

const release =
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1225-m1344.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1225
);

assert.equal(
  release.milestoneEnd,
  1344
);

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.waves,
  10
);

assert.equal(
  release.milestonesPerWave,
  12
);

assert.equal(
  release.monthlyRequiredSpendUsd,
  0
);

assert.equal(
  release.monthlyHardCapUsd,
  100
);

assert.equal(
  release.realProviderCallsDuringBuild,
  false
);

assert.equal(
  release.paidProviderCallsDuringBuild,
  false
);

assert.equal(
  release.realInferenceDefault,
  false
);

assert.equal(
  release.paidInferenceDefault,
  false
);

assert.equal(
  release.silentPaidFallback,
  false
);

assert.equal(
  release.productionAiFilesystemMutation,
  false
);

assert.equal(
  release.autonomousGitPush,
  false
);

assert.equal(
  release.autonomousPurchase,
  false
);

assert.equal(
  release.forcePush,
  false
);

assert.equal(
  release.nativeFoundationModel,
  false
);

console.log(
  'CIWU_OMEGA120_M1225_M1344_TESTS_PASS'
);
