'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const telemetry =
  require(
    '../../src/sovereign/telemetry/provider-envelope-v1'
  );

const ledgerModule =
  require(
    '../../src/sovereign/telemetry/hash-ledger-v1'
  );

const state =
  require(
    '../../src/sovereign/provider-runtime/capability-state-v2'
  );

const eons =
  require(
    '../../src/sovereign/eons/adaptive-router-v6'
  );

const fallback =
  require(
    '../../src/sovereign/federation/fallback-planner-v6'
  );

const m3 =
  require(
    '../../src/sovereign/m3/federation-bridge-v2'
  );

const repair =
  require(
    '../../src/sovereign/codex/repair-campaign-v2'
  );

const neurotex =
  require(
    '../../src/sovereign/neurotex/evidence-weighting-v6'
  );

const health =
  require(
    '../../src/sovereign/runtime/health-revocation-v1'
  );

const t =
  telemetry.create({
    provider:
      'fixture',

    model:
      'fixture-model',

    requestId:
      'req-1',

    status:
      'SUCCESS',

    latencyMs:
      25,

    inputTokens:
      100,

    outputTokens:
      20,

    observedCostUsd:
      0,

    realNetworkCall:
      true
  });

assert.equal(
  telemetry.verify(t),
  true
);

const ledger =
  ledgerModule
    .createLedger();

ledger.append(t);

const t2 =
  telemetry.create({
    provider:
      'fixture',

    model:
      'fixture-model',

    requestId:
      'req-2',

    status:
      'SUCCESS',

    latencyMs:
      30,

    inputTokens:
      120,

    outputTokens:
      30,

    observedCostUsd:
      0,

    realNetworkCall:
      true
  });

ledger.append(t2);

assert.equal(
  ledger.verify(),
  true
);

assert.equal(
  ledger.list().length,
  2
);

assert.equal(
  state.transition(
    'UNCONFIGURED',
    'CONFIGURE'
  ),
  'CONFIGURED'
);

assert.equal(
  state.transition(
    'CONFIGURED',
    'DISCOVER'
  ),
  'DISCOVERED'
);

assert.throws(
  () =>
    state.transition(
      'UNCONFIGURED',
      'ADMIT_RUNTIME'
    ),
  /ILLEGAL_PROVIDER_TRANSITION/
);

assert.equal(
  state.runtimeEligible(
    'RUNTIME_ELIGIBLE'
  ),
  true
);

const providers = [
  {
    provider:
      'a',

    model:
      'a1',

    runtimeEligible:
      true,

    quality:
      0.9,

    reliability:
      0.95,

    speed:
      0.8,

    costEfficiency:
      1,

    evidenceConfidence:
      0.9,

    risk:
      0.1,

    uncertainty:
      0.1
  },

  {
    provider:
      'b',

    model:
      'b1',

    runtimeEligible:
      true,

    quality:
      0.8,

    reliability:
      0.8,

    speed:
      0.7,

    costEfficiency:
      1,

    evidenceConfidence:
      0.8,

    risk:
      0.2,

    uncertainty:
      0.2
  }
];

const choice =
  eons.choose(
    providers
  );

assert.equal(
  choice.selected,
  true
);

assert.equal(
  choice.entry.provider,
  'a'
);

const ranked =
  eons.rank(
    providers
  );

const next =
  fallback.plan({
    ranked,

    attempted:[
      'a::a1'
    ],

    failureClass:
      'TIMEOUT'
  });

assert.equal(
  next.continue,
  true
);

assert.equal(
  next.entry.provider,
  'b'
);

const terminal =
  fallback.plan({
    ranked,

    attempted:[],

    failureClass:
      'AUTHORIZATION_FAILURE'
  });

assert.equal(
  terminal.continue,
  false
);

const bridge =
  m3.prepare({
    providers,
    attempted:[]
  });

assert.equal(
  bridge.ready,
  true
);

assert.equal(
  m3.boundaries()
    .filesystemMutation,
  false
);

const campaign =
  repair.create({
    task:{
      type:
        'FIX'
    },

    contextHash:
      'context',

    provider:
      'a',

    model:
      'a1',

    providerEvidenceHash:
      'provider-evidence'
  });

assert.equal(
  campaign.state,
  'PLANNED_SANDBOX_ONLY'
);

const certifiedRepair =
  repair.certify({
    campaign,

    patchHash:
      'patch',

    sandboxHash:
      'sandbox',

    testHash:
      'tests',

    syntaxPassed:
      true,

    regressionPassed:
      true
  });

assert.equal(
  certifiedRepair.certified,
  true
);

const weight =
  neurotex.weight({
    confidence:
      0.95,

    provenance:
      1,

    regression:
      1,

    freshness:
      0.95,

    sourceIndependence:
      0.9,

    contradictionRisk:
      0.05
  });

assert.ok(
  weight > 0
);

assert.equal(
  neurotex.decide(
    0.9
  ),
  'ACTIVE'
);

assert.equal(
  neurotex.decide(
    0.4
  ),
  'QUARANTINED'
);

assert.equal(
  neurotex.decide(
    0.1
  ),
  'REJECTED'
);

const healthy =
  health.assess({
    receiptValid:
      true,

    priceFresh:
      true,

    benchmarkFresh:
      true,

    circuitOpen:
      false,

    recentFailureRate:
      0.1
  });

assert.equal(
  healthy.healthy,
  true
);

assert.equal(
  healthy.revoke,
  false
);

const unhealthy =
  health.assess({
    receiptValid:
      true,

    priceFresh:
      true,

    benchmarkFresh:
      true,

    circuitOpen:
      true,

    recentFailureRate:
      0.1
  });

assert.equal(
  unhealthy.revoke,
  true
);

const release =
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1105-m1224.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1105
);

assert.equal(
  release.milestoneEnd,
  1224
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

console.log(
  'CIWU_OMEGA120_M1105_M1224_TESTS_PASS'
);
