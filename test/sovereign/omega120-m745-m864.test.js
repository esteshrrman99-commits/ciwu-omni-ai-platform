'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const probe =
  require(
    '../../src/sovereign/provider-runtime/probe-contract-v2'
  );

const probeState =
  require(
    '../../src/sovereign/provider-runtime/probe-state'
  );

const prices =
  require(
    '../../src/sovereign/eons/price-evidence-v3'
  );

const response =
  require(
    '../../src/sovereign/provider-runtime/real-response-verifier'
  );

const cost =
  require(
    '../../src/sovereign/eons/cost-reconciliation-v4'
  );

const registry =
  require(
    '../../src/sovereign/provider-runtime/certified-registry-v5'
  );

const fallback =
  require(
    '../../src/sovereign/provider-runtime/fallback-controller-v5'
  );

const repair =
  require(
    '../../src/sovereign/codex/real-repair-evidence-v2'
  );

const quarantine =
  require(
    '../../src/sovereign/neurotex/quarantine-v4'
  );

const decision =
  require(
    '../../src/sovereign/observability/live-decision-envelope'
  );

(() => {

  const now =
    Date.now();

  // --------------------------------------------------------------
  // WAVE 01
  // --------------------------------------------------------------

  const deniedProbe =
    probe.create({
      provider:
        'groq',
      model:
        'test-model',
      costClass:
        'ZERO_VERIFIED',
      maximumCostUsd:
        0,
      priceEvidenceHash:
        'hash',
      priceEvidenceFresh:
        true,
      explicitAuthorization:
        false
    });

  assert.equal(
    deniedProbe.allowed,
    false
  );

  const allowedProbe =
    probe.create({
      provider:
        'groq',
      model:
        'test-model',
      costClass:
        'ZERO_VERIFIED',
      maximumCostUsd:
        0,
      priceEvidenceHash:
        'hash',
      priceEvidenceFresh:
        true,
      explicitAuthorization:
        true
    });

  assert.equal(
    allowedProbe.allowed,
    true
  );

  assert.equal(
    allowedProbe
      .probe
      .status,
    'AUTHORIZED_NOT_EXECUTED'
  );

  assert.equal(
    probeState.transition(
      'AUTHORIZED_NOT_EXECUTED',
      'START'
    ),
    'EXECUTING'
  );

  assert.throws(
    () =>
      probeState.transition(
        'COMPLETED_SUCCESS',
        'START'
      ),
    /ILLEGAL_PROBE_STATE_TRANSITION/
  );

  // --------------------------------------------------------------
  // WAVE 02
  // --------------------------------------------------------------

  const price =
    prices.create({
      provider:
        'groq',
      model:
        'model',
      costClass:
        'ZERO_VERIFIED',
      source:
        'TEST_SOURCE',
      verifiedAt:
        new Date(now)
          .toISOString(),
      expiresAt:
        new Date(
          now + 60000
        ).toISOString()
    });

  assert.equal(
    prices.evaluate(
      price,
      now
    ).fresh,
    true
  );

  assert.equal(
    prices.evaluate(
      price,
      now + 120000
    ).fresh,
    false
  );

  // --------------------------------------------------------------
  // WAVE 03
  // --------------------------------------------------------------

  const simulated =
    response.verify({
      provider:
        'mock',
      model:
        'model',
      requestBody:
        'hello',
      responseBody:
        'world',
      statusCode:
        200,
      latencyMs:
        10,
      realNetworkCall:
        false
    });

  assert.equal(
    simulated.certified,
    false
  );

  const real =
    response.verify({
      provider:
        'mock',
      model:
        'model',
      requestBody:
        'hello',
      responseBody:
        'world',
      statusCode:
        200,
      latencyMs:
        10,
      realNetworkCall:
        true
    });

  assert.equal(
    real.certified,
    true
  );

  // --------------------------------------------------------------
  // WAVE 04
  // --------------------------------------------------------------

  const reconciled =
    cost.reconcile({
      declaredCostClass:
        'ZERO_VERIFIED',
      observedCostUsd:
        0,
      maximumAuthorizedCostUsd:
        0,
      inputTokens:
        10,
      outputTokens:
        5
    });

  assert.equal(
    reconciled.reconciled,
    true
  );

  assert.equal(
    reconciled.totalTokens,
    15
  );

  assert.equal(
    cost.reconcile({
      declaredCostClass:
        'ZERO_VERIFIED',
      observedCostUsd:
        0.01,
      maximumAuthorizedCostUsd:
        0.01,
      inputTokens:
        1,
      outputTokens:
        1
    }).reconciled,
    false
  );

  // --------------------------------------------------------------
  // WAVE 05
  // --------------------------------------------------------------

  const certified =
    registry.certify({
      provider:
        'mock',
      model:
        'model',
      realResponseCertified:
        true,
      costReconciled:
        true,
      priceEvidenceFresh:
        true,
      benchmarkScore:
        0.9,
      evidenceHash:
        'abc'
    });

  assert.equal(
    certified.certified,
    true
  );

  assert.equal(
    registry.runtimeEligible(
      certified.entry
    ),
    true
  );

  // --------------------------------------------------------------
  // WAVE 06
  // --------------------------------------------------------------

  assert.equal(
    fallback.classifyAction(
      'BILLING_OR_QUOTA_BLOCKED'
    ),
    'TRY_NEXT_PROVIDER'
  );

  assert.equal(
    fallback.classifyAction(
      'AUTHORIZATION_FAILURE'
    ),
    'ABSTAIN'
  );

  const handled =
    fallback.handle({
      failure:
        'BILLING_OR_QUOTA_BLOCKED',

      chain: [
        {id:'a'},
        {id:'b'}
      ],

      attempted:
        ['a']
    });

  assert.equal(
    handled.nextProvider,
    'b'
  );

  // --------------------------------------------------------------
  // WAVE 07
  // --------------------------------------------------------------

  const repairEvidence =
    repair.create({
      providerEvidence: {
        provider:
          'mock',
        model:
          'model',
        realNetworkCall:
          true
      },

      promptContext: {
        task:
          'repair'
      },

      modelOutput:
        'output',

      patchPlan: {
        operations: []
      },

      sandboxResult: {
        temporary:
          true
      },

      testResult: {
        passed:
          true
      },

      certification: {
        certified:
          true
      }
    });

  assert.equal(
    repairEvidence
      .productionMutation,
    false
  );

  assert.equal(
    repairEvidence
      .gitMutation,
    false
  );

  assert.ok(
    repairEvidence
      .evidenceHash
  );

  // --------------------------------------------------------------
  // WAVE 08
  // --------------------------------------------------------------

  const q =
    quarantine.quarantine({
      candidate: {
        fact:
          'test'
      },
      evidenceHash:
        repairEvidence
          .evidenceHash,
      confidence:
        0.9
    });

  assert.equal(
    q.state,
    'QUARANTINED'
  );

  const promoted =
    quarantine.promote(
      q,
      {
        evidenceVerified:
          true,
        regressionPassed:
          true,
        provenanceValid:
          true,
        confidenceThreshold:
          0.8
      }
    );

  assert.equal(
    promoted.promoted,
    true
  );

  assert.equal(
    promoted
      .record
      .state,
    'ACTIVE'
  );

  // --------------------------------------------------------------
  // WAVE 09
  // --------------------------------------------------------------

  const envelope =
    decision.create({
      taskId:
        'task-1',

      provider:
        'mock',

      model:
        'model',

      routingScore:
        0.9,

      evidenceHash:
        repairEvidence
          .evidenceHash,

      decision:
        'CERTIFIED_PROPOSAL',

      safety: {
        productionMutation:
          false,
        autonomousPush:
          false,
        autonomousPurchase:
          false
      },

      authorization: {
        realInference:
          false,
        paidInference:
          false
      }
    });

  assert.equal(
    decision.safe(
      envelope
    ),
    true
  );

  // --------------------------------------------------------------
  // WAVE 10
  // --------------------------------------------------------------

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m745-m864.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    745
  );

  assert.equal(
    ledger.milestoneEnd,
    864
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
    ledger.zeroCostProbeMaximumUsd,
    0
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
    ledger.productionAiFilesystemMutation,
    false
  );

  assert.equal(
    ledger.autonomousGitPush,
    false
  );

  assert.equal(
    ledger.autonomousPurchase,
    false
  );

  assert.equal(
    ledger.forcePush,
    false
  );

  console.log(
    'CIWU_OMEGA120_M745_M864_TESTS_PASS'
  );
})();
