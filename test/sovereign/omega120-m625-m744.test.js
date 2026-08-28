'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const fingerprint =
  require(
    '../../src/sovereign/release/deployment-fingerprint'
  );

const evidence =
  require(
    '../../src/sovereign/provider-runtime/inference-evidence'
  );

const probe =
  require(
    '../../src/sovereign/provider-runtime/zero-cost-probe'
  );

const promotion =
  require(
    '../../src/sovereign/provider-runtime/promotion-registry'
  );

const demotion =
  require(
    '../../src/sovereign/provider-runtime/demotion'
  );

const tournament =
  require(
    '../../src/sovereign/benchmark/promotion-tournament'
  );

const fallback =
  require(
    '../../src/sovereign/provider-runtime/fallback-chain-v4'
  );

const externalTrial =
  require(
    '../../src/sovereign/codex/external-model-trial'
  );

const lifecycle =
  require(
    '../../src/sovereign/neurotex/knowledge-lifecycle'
  );

const github =
  require(
    '../../src/sovereign/github/execution-protocol-v2'
  );

const boundary =
  require(
    '../../src/sovereign/github/execution-boundary-v2'
  );

(async () => {

  const SHA =
    'a'.repeat(40);

  // --------------------------------------------------------------
  // M625-M636
  // --------------------------------------------------------------

  assert.equal(
    fingerprint
      .normalizeSha(SHA),
    SHA
  );

  assert.equal(
    fingerprint
      .normalizeSha('bad'),
    null
  );

  const runtime =
    fingerprint
      .runtimeFingerprint({
        RENDER:
          'true',

        RENDER_GIT_COMMIT:
          SHA,

        RENDER_GIT_BRANCH:
          'main',

        RENDER_GIT_REPO_SLUG:
          'owner/repo',

        RENDER_SERVICE_ID:
          'srv-test'
      });

  assert.equal(
    runtime.gitCommit,
    SHA
  );

  assert.equal(
    fingerprint.certify({
      expectedCommit:
        SHA,
      runtimeCommit:
        SHA
    }).certified,
    true
  );

  assert.equal(
    fingerprint.certify({
      expectedCommit:
        SHA,
      runtimeCommit:
        'b'.repeat(40)
    }).certified,
    false
  );

  // --------------------------------------------------------------
  // M637-M648
  // --------------------------------------------------------------

  const ev =
    evidence.create({
      provider:
        'mock',

      model:
        'mock-model',

      request:
        'hello',

      response:
        'world',

      latencyMs:
        10,

      inputTokens:
        2,

      outputTokens:
        3,

      costUsd:
        0,

      costClass:
        'ZERO_VERIFIED',

      realInference:
        true
    });

  assert.equal(
    ev.totalTokens,
    5
  );

  assert.equal(
    ev.realInference,
    true
  );

  // --------------------------------------------------------------
  // M649-M660
  // --------------------------------------------------------------

  assert.equal(
    probe.authorize({
      explicitAuthorization:
        false,
      costClass:
        'ZERO_VERIFIED',
      priceEvidenceFresh:
        true,
      providerConfigured:
        true,
      requestedMaximumCostUsd:
        0
    }).allowed,
    false
  );

  assert.equal(
    probe.authorize({
      explicitAuthorization:
        true,
      costClass:
        'ZERO_VERIFIED',
      priceEvidenceFresh:
        true,
      providerConfigured:
        true,
      requestedMaximumCostUsd:
        0
    }).allowed,
    true
  );

  assert.equal(
    probe.authorize({
      explicitAuthorization:
        true,
      costClass:
        'PAID',
      priceEvidenceFresh:
        true,
      providerConfigured:
        true,
      requestedMaximumCostUsd:
        0
    }).allowed,
    false
  );

  // --------------------------------------------------------------
  // M661-M672
  // --------------------------------------------------------------

  const promoted =
    promotion.promote({
      provider:
        'mock',

      model:
        'model',

      inferenceCertified:
        true,

      costCertified:
        true,

      costClass:
        'ZERO_VERIFIED',

      evidenceHash:
        'hash',

      benchmarkScore:
        0.95
    });

  assert.equal(
    promoted.promoted,
    true
  );

  assert.equal(
    demotion.evaluate({
      billingBlocked:
        true
    }).demote,
    true
  );

  // --------------------------------------------------------------
  // M673-M684
  // --------------------------------------------------------------

  const decision =
    tournament
      .promotionDecision(
        [
          {
            id:'a',
            inferenceCertified:true,
            costCertified:true,
            score:0.95
          },
          {
            id:'b',
            inferenceCertified:true,
            costCertified:true,
            score:0.85
          },
          {
            id:'c',
            inferenceCertified:false,
            costCertified:true,
            score:1
          }
        ],
        {
          minimumScore:
            0.7,
          limit:
            2
        }
      );

  assert.deepEqual(
    decision.promotedIds,
    ['a','b']
  );

  // --------------------------------------------------------------
  // M685-M696
  // --------------------------------------------------------------

  const chain =
    fallback.build([
      {
        id:'a',
        runtimeEligible:true,
        available:true,
        demoted:false,
        costClass:
          'ZERO_VERIFIED',
        runtimeScore:
          0.9
      },
      {
        id:'b',
        runtimeEligible:true,
        available:true,
        demoted:false,
        costClass:
          'ZERO_VERIFIED',
        runtimeScore:
          0.8
      },
      {
        id:'bad',
        runtimeEligible:true,
        available:true,
        demoted:true,
        runtimeScore:
          1
      }
    ]);

  assert.equal(
    chain[0].id,
    'a'
  );

  assert.equal(
    fallback.next({
      chain,
      attempted:['a']
    }).id,
    'b'
  );

  assert.equal(
    fallback.mayFallback(
      'BILLING_OR_QUOTA_BLOCKED'
    ),
    true
  );

  // --------------------------------------------------------------
  // M697-M708
  // --------------------------------------------------------------

  const realTrial =
    await externalTrial.execute({
      providerEvidence: {
        realInference:
          true,
        provider:
          'mock-provider',
        model:
          'mock-model'
      },

      requestModel:
        async () =>
          JSON.stringify({
            operations: [
              {
                type:
                  'replace',
                file:
                  'fixture.js',
                before:
                  'const x = 1;',
                after:
                  'const x = 2;'
              }
            ]
          }),

      prompt:
        'repair fixture',

      applySandboxPatch:
        async plan => ({
          plan,
          applied:true
        }),

      runSandboxTests:
        async () => ({
          syntaxPassed:
            true,
          testsPassed:
            true,
          cleanupConfirmed:
            true
        })
    });

  assert.equal(
    realTrial
      .certification
      .certified,
    true
  );

  assert.equal(
    realTrial
      .productionMutation,
    false
  );

  // --------------------------------------------------------------
  // M709-M720
  // --------------------------------------------------------------

  const knowledge =
    lifecycle.promote({
      fact: {
        pattern:
          'validated repair'
      },

      evidenceHash:
        'abc',

      confidence:
        0.9,

      certifiedTrial:
        true
    });

  assert.equal(
    knowledge.promoted,
    true
  );

  const revoked =
    lifecycle.revoke(
      knowledge.record,
      {
        regressionDetected:
          true
      }
    );

  assert.equal(
    revoked.revoked,
    true
  );

  assert.equal(
    revoked.record.state,
    'REVOKED'
  );

  // --------------------------------------------------------------
  // M721-M732
  // --------------------------------------------------------------

  const gitAllowed =
    github.authorize({
      intent: {
        forcePush:false
      },

      explicitHumanApproval:
        true,

      expectedBaseCommit:
        'abc',

      currentBaseCommit:
        'abc',

      approvalTokenValid:
        true
    });

  assert.equal(
    gitAllowed.allowed,
    true
  );

  assert.equal(
    boundary
      .BOUNDARY
      .forcePush,
    false
  );

  assert.equal(
    boundary
      .BOUNDARY
      .pushWithoutApproval,
    false
  );

  // --------------------------------------------------------------
  // M733-M744
  // --------------------------------------------------------------

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m625-m744.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    625
  );

  assert.equal(
    ledger.milestoneEnd,
    744
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
    ledger.commitBoundDeploymentTruth,
    true
  );

  assert.equal(
    ledger.realProviderCallsDuringBuild,
    false
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
    ledger.autonomousPurchase,
    false
  );

  assert.equal(
    ledger.forcePush,
    false
  );

  console.log(
    'CIWU_OMEGA120_M625_M744_TESTS_PASS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
