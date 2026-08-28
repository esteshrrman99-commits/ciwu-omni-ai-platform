'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const ceremony =
  require(
    '../../src/sovereign/certification/ceremony-v2'
  );

const probe =
  require(
    '../../src/sovereign/certification/zero-cost-probe-plan-v3'
  );

const receipt =
  require(
    '../../src/sovereign/certification/response-receipt-v4'
  );

const calibration =
  require(
    '../../src/sovereign/eons/routing-calibrator-v7'
  );

const queueModule =
  require(
    '../../src/sovereign/provider-runtime/recertification-queue-v2'
  );

const workbench =
  require(
    '../../src/sovereign/m3/workbench-state-v1'
  );

const proposal =
  require(
    '../../src/sovereign/codex/proposal-ceremony-v4'
  );

const replayModule =
  require(
    '../../src/sovereign/neurotex/replay-ledger-v8'
  );

const revocation =
  require(
    '../../src/sovereign/runtime/revocation-replay-v2'
  );

const expires =
  new Date(
    Date.now() + 60000
  ).toISOString();

const c =
  ceremony.create({
    provider:'fixture',
    model:'fixture-model',
    authorization:
      'EXPLICITLY_AUTHORIZED',
    costClass:
      'ZERO_VERIFIED',
    expiresAt:expires
  });

assert.equal(
  c.consumed,
  false
);

ceremony.consume(c);

assert.equal(
  c.consumed,
  true
);

assert.throws(
  () => ceremony.consume(c),
  /CEREMONY_ALREADY_CONSUMED/
);

const deniedProbe =
  probe.build({
    provider:'fixture',
    model:'fixture-model',
    priceEvidence:{
      status:'UNKNOWN'
    },
    authorization:
      'EXPLICITLY_AUTHORIZED'
  });

assert.equal(
  deniedProbe.executable,
  false
);

const readyProbe =
  probe.build({
    provider:'fixture',
    model:'fixture-model',
    priceEvidence:{
      status:'ZERO_VERIFIED'
    },
    authorization:
      'EXPLICITLY_AUTHORIZED',
    maxObservedCostUsd:0
  });

assert.equal(
  readyProbe.executable,
  true
);

assert.equal(
  readyProbe.paidFallbackAuthorized,
  false
);

const r =
  receipt.create({
    ceremonyId:'ceremony',
    nonce:'nonce',
    provider:'fixture',
    model:'fixture-model',
    httpStatus:200,
    responseBody:{
      ok:true
    },
    observedCostUsd:0,
    networkObserved:true
  });

assert.equal(
  receipt.verify(r),
  true
);

const scores =
  calibration.rank([
    {
      provider:'a',
      metrics:{
        quality:0.9,
        reliability:0.9,
        latencyEfficiency:0.9,
        costEfficiency:1,
        evidenceConfidence:1,
        failurePenalty:0
      }
    },
    {
      provider:'b',
      metrics:{
        quality:0.7,
        reliability:0.7,
        latencyEfficiency:0.7,
        costEfficiency:1,
        evidenceConfidence:1,
        failurePenalty:0
      }
    }
  ]);

assert.equal(
  scores[0].provider,
  'a'
);

const queue =
  queueModule.create();

const item =
  queue.enqueue({
    provider:'a',
    model:'a1',
    reason:'EXPIRED',
    evidenceHash:'hash'
  });

const duplicate =
  queue.enqueue({
    provider:'a',
    model:'a1',
    reason:'EXPIRED',
    evidenceHash:'hash'
  });

assert.equal(
  item.id,
  duplicate.id
);

queue.resolve(
  item.id,
  true
);

assert.equal(
  queue.snapshot()[0].state,
  'CERTIFIED'
);

const wb =
  workbench.build({
    providers:[
      {
        provider:'a',
        model:'a1',
        configured:true,
        certified:true,
        runtimeEligible:true,
        evidenceFresh:true,
        costClass:'ZERO_VERIFIED',
        circuitOpen:false
      }
    ]
  });

assert.equal(
  wb.executionEnabled,
  false
);

assert.equal(
  wb.productionMutationEnabled,
  false
);

const p =
  proposal.create({
    baseCommit:'abc',
    patchHash:'patch',
    sandboxEvidenceHash:'sandbox',
    regressionEvidenceHash:'regression',
    providerEvidenceHash:'provider'
  });

assert.equal(
  p.humanApproval,
  false
);

const approved =
  proposal.approve(
    p,
    'abc'
  );

assert.equal(
  approved.humanApproval,
  true
);

assert.equal(
  approved.gitPushAuthorized,
  false
);

const replay =
  replayModule.create();

replay.append({
  experienceId:'x1',
  evidenceHash:'e1',
  regressionHash:'r1',
  outcome:'SUCCESS'
});

assert.equal(
  replay.verify(),
  true
);

const revoked =
  revocation.replay({
    provider:'a',
    model:'a1',
    events:[
      {
        provider:'a',
        model:'a1',
        type:'REVOKE',
        reason:'STALE'
      }
    ]
  });

assert.equal(
  revoked.revoked,
  true
);

assert.equal(
  revoked.runtimeEligible,
  false
);

const restored =
  revocation.replay({
    provider:'a',
    model:'a1',
    events:[
      {
        provider:'a',
        model:'a1',
        type:'REVOKE',
        reason:'STALE'
      },
      {
        provider:'a',
        model:'a1',
        type:'RECERTIFY',
        certified:true
      }
    ]
  });

assert.equal(
  restored.revoked,
  false
);

const release =
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1345-m1464.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1345
);

assert.equal(
  release.milestoneEnd,
  1464
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
  release.paidInferenceDefault,
  false
);

assert.equal(
  release.silentPaidFallback,
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
  'CIWU_OMEGA120_M1345_M1464_TESTS_PASS'
);
