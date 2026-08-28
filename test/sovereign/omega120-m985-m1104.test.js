'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const adapterContract =
  require(
    '../../src/sovereign/provider-runtime/provider-adapter-contract-v1'
  );

const adapterRegistry =
  require(
    '../../src/sovereign/provider-runtime/provider-adapter-registry-v1'
  );

const campaign =
  require(
    '../../src/sovereign/provider-runtime/certification-campaign-v1'
  );

const admission =
  require(
    '../../src/sovereign/provider-runtime/candidate-admission-v1'
  );

const selector =
  require(
    '../../src/sovereign/provider-runtime/candidate-selector-v1'
  );

const tournament =
  require(
    '../../src/sovereign/benchmark/certification-tournament-v4'
  );

const runtimeRegistry =
  require(
    '../../src/sovereign/provider-runtime/runtime-registry-v7'
  );

const recert =
  require(
    '../../src/sovereign/provider-runtime/recertification-policy-v1'
  );

const m3 =
  require(
    '../../src/sovereign/m3/sovereign-routing-v1'
  );

const repair =
  require(
    '../../src/sovereign/codex/live-repair-ceremony-v1'
  );

const experience =
  require(
    '../../src/sovereign/neurotex/certified-experience-v5'
  );

(async () => {

  const fixtureAdapter = {
    id:
      'fixture',

    configured:
      () => true,

    discoverModels:
      async () => ['model-a'],

    prepareProbe:
      async () => ({
        ok:true
      }),

    executeProbe:
      async () => ({
        ok:true
      }),

    classifyFailure:
      () => 'SUCCESS'
  };

  assert.equal(
    adapterContract
      .validate(
        fixtureAdapter
      )
      .valid,
    true
  );

  const registry =
    adapterRegistry
      .createRegistry();

  registry.register(
    fixtureAdapter
  );

  assert.deepEqual(
    registry.list(),
    ['fixture']
  );

  assert.throws(
    () =>
      registry.register(
        fixtureAdapter
      ),
    /ADAPTER_ALREADY_REGISTERED/
  );

  const planned =
    campaign.create({
      candidates: [
        {
          provider:
            'fixture',

          model:
            'model-a',

          priceEvidenceHash:
            'price-hash',

          costClass:
            'ZERO_VERIFIED'
        }
      ],

      zeroCostOnly:
        true,

      maximumCampaignCostUsd:
        0,

      explicitExecutionRequired:
        true
    });

  assert.equal(
    planned.state,
    'PLANNED_NOT_EXECUTED'
  );

  assert.equal(
    campaign.verify(
      planned
    ),
    true
  );

  const admitted =
    admission.evaluate({
      configured:
        true,

      discovered:
        true,

      priceFresh:
        true,

      costClass:
        'ZERO_VERIFIED',

      priceEvidenceHash:
        'price-hash',

      modelAllowed:
        true,

      providerAllowed:
        true
    });

  assert.equal(
    admitted.admitted,
    true
  );

  const rejected =
    admission.evaluate({
      configured:
        true,

      discovered:
        true,

      priceFresh:
        false,

      costClass:
        'ZERO_VERIFIED',

      priceEvidenceHash:
        'price-hash',

      modelAllowed:
        true,

      providerAllowed:
        true
    });

  assert.equal(
    rejected.admitted,
    false
  );

  assert.equal(
    selector.select([
      {
        provider:
          'fixture',

        model:
          'model-a',

        priceEvidenceHash:
          'price-hash',

        admitted:
          true
      },

      {
        provider:
          'blocked',

        model:
          'bad',

        admitted:
          false
      }
    ]).length,
    1
  );

  let calls = 0;

  const deniedTournament =
    await tournament.run({
      candidates: [
        {
          provider:
            'fixture',
          model:
            'model-a',
          admitted:
            true
        }
      ],

      explicitAuthorization:
        false,

      executeCandidate:
        async () => {
          calls += 1;
          return {ok:true};
        }
    });

  assert.equal(
    deniedTournament.executed,
    false
  );

  assert.equal(
    calls,
    0
  );

  const tournamentResult =
    await tournament.run({
      candidates: [
        {
          provider:
            'fixture',
          model:
            'model-a',
          admitted:
            true
        }
      ],

      explicitAuthorization:
        true,

      executeCandidate:
        async candidate => {
          calls += 1;

          return {
            certified:true,
            provider:
              candidate.provider
          };
        }
    });

  assert.equal(
    tournamentResult.executed,
    true
  );

  assert.equal(
    tournament.successful(
      tournamentResult
    ).length,
    1
  );

  const rr =
    runtimeRegistry
      .createRegistry();

  const runtimeEntry =
    rr.admit({
      admitted:
        true,

      provider:
        'fixture',

      model:
        'model-a',

      evidenceHash:
        'evidence-hash',

      runtimeScore:
        0.95
    });

  assert.equal(
    runtimeEntry.runtimeEligible,
    true
  );

  assert.equal(
    rr.eligible().length,
    1
  );

  rr.revoke(
    'fixture',
    'model-a',
    'TEST_REVOCATION'
  );

  assert.equal(
    rr.eligible().length,
    0
  );

  const now =
    Date.now();

  const validRecert =
    recert.evaluate({
      certifiedAt:
        new Date(
          now - 1000
        ).toISOString(),

      expiresAt:
        new Date(
          now + 60000
        ).toISOString(),

      receiptValid:
        true,

      priceFresh:
        true,

      benchmarkFresh:
        true,

      now
    });

  assert.equal(
    validRecert
      .runtimeEligible,
    true
  );

  const expired =
    recert.evaluate({
      certifiedAt:
        new Date(
          now - 120000
        ).toISOString(),

      expiresAt:
        new Date(
          now - 1000
        ).toISOString(),

      receiptValid:
        true,

      priceFresh:
        true,

      benchmarkFresh:
        true,

      now
    });

  assert.equal(
    expired
      .recertificationRequired,
    true
  );

  const route =
    m3.route({
      entries: [
        {
          provider:
            'fixture',

          model:
            'model-a',

          runtimeEligible:
            true,

          runtimeScore:
            0.9
        },

        {
          provider:
            'blocked',

          model:
            'model-z',

          runtimeEligible:
            false,

          runtimeScore:
            1
        }
      ]
    });

  assert.equal(
    route.routed,
    true
  );

  assert.equal(
    route.entry.provider,
    'fixture'
  );

  assert.equal(
    m3.executionBoundary()
      .m3Execute,
    false
  );

  const repairResult =
    await repair.run({
      providerEntry: {
        runtimeEligible:
          true,

        provider:
          'fixture',

        model:
          'model-a'
      },

      context: {
        task:
          'repair fixture'
      },

      requestModel:
        async () => ({
          operations:[
            {
              type:'replace'
            }
          ]
        }),

      parsePatch:
        output => output,

      executeSandbox:
        async patch => ({
          patch,
          syntaxPassed:true,
          testsPassed:true
        }),

      certifySandbox:
        result => ({
          certified:
            result.syntaxPassed ===
            true &&
            result.testsPassed ===
            true
        })
    });

  assert.equal(
    repairResult.executed,
    true
  );

  assert.equal(
    repairResult
      .certification
      .certified,
    true
  );

  assert.equal(
    repairResult
      .productionMutation,
    false
  );

  const exp =
    experience.create({
      task: {
        type:
          'REPAIR'
      },

      provider:
        'fixture',

      model:
        'model-a',

      providerEvidenceHash:
        'provider-hash',

      repairEvidenceHash:
        'repair-hash',

      regressionPassed:
        true,

      confidence:
        0.9
    });

  assert.equal(
    exp.state,
    'ACTIVE'
  );

  assert.ok(
    exp.experienceHash
  );

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m985-m1104.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    985
  );

  assert.equal(
    ledger.milestoneEnd,
    1104
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
    ledger.paidProviderCallsDuringBuild,
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
    ledger.autonomousPurchase,
    false
  );

  assert.equal(
    ledger.forcePush,
    false
  );

  console.log(
    'CIWU_OMEGA120_M985_M1104_TESTS_PASS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
