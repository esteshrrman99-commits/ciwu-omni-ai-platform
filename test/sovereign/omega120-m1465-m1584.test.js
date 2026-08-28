'use strict';

const assert=
  require('node:assert/strict');

const fs=
  require('node:fs');

const credentials=
  require(
    '../../src/sovereign/provider-runtime/credential-truth-v3'
  );

const price=
  require(
    '../../src/sovereign/evidence/price-record-v4'
  );

const auth=
  require(
    '../../src/sovereign/certification/zero-cost-execution-auth-v1'
  );

const verifier=
  require(
    '../../src/sovereign/certification/response-verifier-v5'
  );

const healthModule=
  require(
    '../../src/sovereign/provider-runtime/health-journal-v3'
  );

const eons=
  require(
    '../../src/sovereign/eons/admission-score-v8'
  );

const matrix=
  require(
    '../../src/sovereign/m3/provider-decision-matrix-v2'
  );

const intent=
  require(
    '../../src/sovereign/codex/execution-intent-v5'
  );

const neurotex=
  require(
    '../../src/sovereign/neurotex/promotion-ledger-v9'
  );

const c=
  credentials.assess({
    credentialPresent:true,
    credentialSource:'ENVIRONMENT',
    printedOrLogged:false,
    embeddedInSource:false
  });

assert.equal(c.configured,true);
assert.equal(c.secure,true);
assert.equal(c.certified,false);

const p=
  price.create({
    provider:'fixture',
    model:'fixture-model',
    source:'official-fixture',
    verifiedAt:'2026-01-01T00:00:00Z',
    expiresAt:'2026-01-02T00:00:00Z',
    inputUsdPerMillion:0,
    outputUsdPerMillion:0,
    zeroCostStatus:'ZERO_VERIFIED'
  });

assert.ok(p.evidenceHash);

assert.equal(
  price.fresh(
    p,
    new Date(
      '2026-01-01T12:00:00Z'
    ).getTime()
  ),
  true
);

const a=
  auth.authorize({
    provider:'fixture',
    model:'fixture-model',
    ceremonyId:'ceremony',
    priceEvidenceFresh:true,
    zeroCostStatus:'ZERO_VERIFIED',
    explicitUserAuthorization:true,
    maximumCostUsd:0
  });

assert.equal(a.authorized,true);
assert.equal(a.paidFallback,false);

const denied=
  auth.authorize({
    provider:'fixture',
    model:'fixture-model',
    ceremonyId:'ceremony',
    priceEvidenceFresh:true,
    zeroCostStatus:'UNKNOWN',
    explicitUserAuthorization:true,
    maximumCostUsd:0
  });

assert.equal(denied.authorized,false);

const verified=
  verifier.verify({
    receipt:{
      provider:'fixture',
      model:'fixture-model',
      ceremonyId:'ceremony',
      networkObserved:true,
      observedCostUsd:0,
      httpStatus:200
    },
    expectedProvider:'fixture',
    expectedModel:'fixture-model',
    expectedCeremonyId:'ceremony',
    maximumObservedCostUsd:0
  });

assert.equal(verified.verified,true);

const journal=
  healthModule.create();

journal.append({
  provider:'fixture',
  model:'fixture-model',
  state:'HEALTHY',
  evidenceHash:'e1'
});

assert.equal(
  journal.latest(
    'fixture',
    'fixture-model'
  ).state,
  'HEALTHY'
);

const score=
  eons.evaluate({
    quality:0.9,
    reliability:0.9,
    latencyEfficiency:0.8,
    costEfficiency:1,
    evidenceConfidence:1,
    healthConfidence:1,
    failurePenalty:0,
    authorizationValid:true,
    safetyValid:true,
    evidenceFresh:true
  });

assert.equal(score.admitted,true);
assert.ok(score.score > 0.8);

const blockedScore=
  eons.evaluate({
    quality:1,
    reliability:1,
    latencyEfficiency:1,
    costEfficiency:1,
    evidenceConfidence:1,
    healthConfidence:1,
    failurePenalty:0,
    authorizationValid:false,
    safetyValid:true,
    evidenceFresh:true
  });

assert.equal(
  blockedScore.admitted,
  false
);

assert.equal(
  blockedScore.score,
  0
);

const rows=
  matrix.build([
    {
      provider:'a',
      model:'a1',
      configured:true,
      certified:true,
      priceFresh:true,
      health:'HEALTHY',
      circuitOpen:false,
      revoked:false,
      score:0.9
    },
    {
      provider:'b',
      model:'b1',
      configured:true,
      certified:false,
      priceFresh:true,
      health:'HEALTHY',
      circuitOpen:false,
      revoked:false,
      score:1
    }
  ]);

assert.equal(rows[0].provider,'a');
assert.equal(rows[0].eligible,true);

const i=
  intent.create({
    baseCommit:'abc',
    patchHash:'patch',
    sandboxOnly:true,
    allowedCommands:[
      'npm test'
    ],
    humanApproval:false
  });

assert.equal(
  i.productionMutation,
  false
);

assert.equal(
  i.gitPush,
  false
);

assert.equal(
  neurotex.decide({
    posterior:0.9,
    evidenceValid:true,
    regressionValid:true,
    provenanceValid:true
  }).state,
  'ACTIVE'
);

assert.equal(
  neurotex.decide({
    posterior:0.9,
    evidenceValid:false,
    regressionValid:true,
    provenanceValid:true
  }).state,
  'QUARANTINED'
);

assert.equal(
  neurotex.decide({
    posterior:0.1,
    evidenceValid:true,
    regressionValid:true,
    provenanceValid:true
  }).state,
  'REJECTED'
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1465-m1584.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1465
);

assert.equal(
  release.milestoneEnd,
  1584
);

assert.equal(
  release.milestoneCount,
  120
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
  release.zeroCostProbeMaxUsd,
  0
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
  'CIWU_OMEGA120_M1465_M1584_TESTS_PASS'
);
