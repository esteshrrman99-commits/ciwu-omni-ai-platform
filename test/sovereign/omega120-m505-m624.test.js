'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const certification =
  require(
    '../../src/sovereign/provider-runtime/certification-session'
  );

const certTruth =
  require(
    '../../src/sovereign/provider-runtime/certification-truth'
  );

const failureTruth =
  require(
    '../../src/sovereign/provider-runtime/failure-truth-v3'
  );

const penalty =
  require(
    '../../src/sovereign/provider-runtime/provider-penalty'
  );

const benchmark =
  require(
    '../../src/sovereign/benchmark/evidence-ledger'
  );

const comparator =
  require(
    '../../src/sovereign/benchmark/comparator'
  );

const router =
  require(
    '../../src/sovereign/provider-runtime/router-v3'
  );

const trial =
  require(
    '../../src/sovereign/codex/certified-trial'
  );

const model =
  require(
    '../../src/sovereign/codex/deterministic-test-model'
  );

const neurotex =
  require(
    '../../src/sovereign/neurotex/learning-ledger-v3'
  );

const prPlan =
  require(
    '../../src/sovereign/github/pr-plan'
  );

const prPolicy =
  require(
    '../../src/sovereign/github/pr-policy'
  );

const trace =
  require(
    '../../src/sovereign/observability/decision-trace'
  );

const runtimeSummary =
  require(
    '../../src/sovereign/observability/runtime-summary'
  );

const pipeline =
  require(
    '../../src/sovereign/end-to-end-pipeline'
  );

(async () => {

  const tmp =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-m624-'
      )
    );

  // --------------------------------------------------------------
  // M505-M516
  // --------------------------------------------------------------

  const blocked =
    certification.create({
      provider:
        'mock',
      model:
        'mock-model',
      costClass:
        'ZERO_VERIFIED',
      authorization: {
        realInference:
          false,
        paidInference:
          false
      }
    });

  assert.equal(
    blocked.allowed,
    false
  );

  const allowed =
    certification.create({
      provider:
        'mock',
      model:
        'mock-model',
      costClass:
        'ZERO_VERIFIED',
      authorization: {
        realInference:
          true,
        paidInference:
          false
      }
    });

  assert.equal(
    allowed.allowed,
    true
  );

  assert.equal(
    certTruth.derive(
      allowed
    ),
    'AUTHORIZED_NOT_EXECUTED'
  );

  const completed =
    certification.complete(
      allowed.session,
      {
        realInference:
          true,
        success:
          true,
        latencyMs:
          10,
        costUsd:
          0,
        responseHash:
          'abc'
      }
    );

  assert.equal(
    certTruth.derive(
      completed
    ),
    'REAL_INFERENCE_CERTIFIED'
  );

  // --------------------------------------------------------------
  // M517-M528
  // --------------------------------------------------------------

  assert.equal(
    failureTruth.classify({
      httpStatus:
        429,
      message:
        'no credits remaining'
    }),
    'BILLING_OR_QUOTA_BLOCKED'
  );

  assert.equal(
    failureTruth
      .fallbackEligible(
        'BILLING_OR_QUOTA_BLOCKED'
      ),
    true
  );

  assert.equal(
    penalty.penalty(
      'BILLING_OR_QUOTA_BLOCKED'
    ),
    1
  );

  // --------------------------------------------------------------
  // M529-M540
  // --------------------------------------------------------------

  const benchFile =
    path.join(
      tmp,
      'bench.jsonl'
    );

  benchmark.append(
    benchFile,
    {
      provider:
        'mock',
      model:
        'a',
      score:
        1
    }
  );

  benchmark.append(
    benchFile,
    {
      provider:
        'mock',
      model:
        'b',
      score:
        0.5
    }
  );

  const rows =
    benchmark.read(
      benchFile
    );

  assert.equal(
    rows.length,
    2
  );

  assert.equal(
    benchmark.verify(
      rows
    ),
    true
  );

  assert.equal(
    comparator.rank([
      {
        id:'a',
        accuracy:1,
        reliability:1,
        latencyScore:1,
        costScore:1,
        evidenceConfidence:1
      },
      {
        id:'b',
        accuracy:0.5,
        reliability:1,
        latencyScore:1,
        costScore:1,
        evidenceConfidence:1
      }
    ])[0].id,
    'a'
  );

  // --------------------------------------------------------------
  // M541-M552
  // --------------------------------------------------------------

  const routed =
    router.choose(
      [
        {
          id:
            'blocked',

          certified:
            false,

          available:
            true,

          costClass:
            'ZERO_VERIFIED',

          projectedCostUsd:
            0,

          baseScore:
            1
        },

        {
          id:
            'free',

          certified:
            true,

          available:
            true,

          costClass:
            'ZERO_VERIFIED',

          projectedCostUsd:
            0,

          baseScore:
            0.9,

          lastFailure:
            'SUCCESS'
        }
      ],
      {
        paidAuthorized:
          false,
        remainingBudgetUsd:
          100
      }
    );

  assert.equal(
    routed.selected,
    'free'
  );

  // --------------------------------------------------------------
  // M553-M564
  // --------------------------------------------------------------

  const certifiedTrial =
    await trial.run({
      prompt:
        'repair fixture',

      invokeModel:
        model.invoke,

      applySandboxPatch:
        async plan => ({
          applied:
            true,
          plan
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
    certifiedTrial
      .certification
      .certified,
    true
  );

  assert.equal(
    certifiedTrial
      .productionMutation,
    false
  );

  // --------------------------------------------------------------
  // M565-M576
  // --------------------------------------------------------------

  const learningFile =
    path.join(
      tmp,
      'learning.jsonl'
    );

  const promoted =
    neurotex.promote({
      file:
        learningFile,

      trial:
        certifiedTrial,

      fact: {
        pattern:
          'fixture repair validated'
      },

      confidence:
        0.9
    });

  assert.equal(
    promoted.promoted,
    true
  );

  // --------------------------------------------------------------
  // M577-M588
  // --------------------------------------------------------------

  const plan =
    prPlan.create({
      repository:
        'owner/repo',

      baseBranch:
        'main',

      baseCommit:
        'abc123',

      proposalId:
        'proposal-1',

      changedFiles: [
        'b.js',
        'a.js'
      ],

      title:
        'Test proposal'
    });

  assert.equal(
    plan.dryRun,
    true
  );

  assert.equal(
    plan.pushed,
    false
  );

  assert.equal(
    prPolicy.mayExecute({
      plan,
      explicitHumanApproval:
        false,
      baseCommitStillCurrent:
        true
    }),
    false
  );

  // --------------------------------------------------------------
  // M589-M600
  // --------------------------------------------------------------

  const t =
    trace.create({
      action:
        'TEST',
      inputs: {
        a:1
      },
      gates: {
        safe:true
      },
      decision:
        'PASS'
    });

  assert.equal(
    trace.valid(t),
    true
  );

  const summary =
    runtimeSummary.summarize({
      providers: [
        {
          certified:true,
          available:true
        }
      ],
      budget: {
        hardCapUsd:
          100,
        spentUsd:
          0
      },
      safety: {
        productionMutation:
          false,
        autonomousPush:
          false,
        autonomousPurchase:
          false
      }
    });

  assert.equal(
    summary
      .certifiedProviderCount,
    1
  );

  // --------------------------------------------------------------
  // M601-M612
  // --------------------------------------------------------------

  const full =
    await pipeline.execute({
      providers: [
        {
          id:
            'deterministic-local',

          certified:
            true,

          available:
            true,

          costClass:
            'ZERO_VERIFIED',

          projectedCostUsd:
            0,

          baseScore:
            1,

          lastFailure:
            'SUCCESS'
        }
      ],

      routingOptions: {
        paidAuthorized:
          false,
        remainingBudgetUsd:
          100
      },

      prompt:
        'repair fixture',

      invokeModel:
        model.invoke,

      applySandboxPatch:
        async plan => ({
          applied:
            true,
          plan
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
    full.ok,
    true
  );

  assert.equal(
    full.decision,
    'CERTIFIED_PROPOSAL'
  );

  assert.equal(
    trace.valid(
      full.trace
    ),
    true
  );

  // --------------------------------------------------------------
  // M613-M624
  // --------------------------------------------------------------

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m505-m624.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    505
  );

  assert.equal(
    ledger.milestoneEnd,
    624
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
    ledger.autonomousPurchase,
    false
  );

  assert.equal(
    ledger.forcePush,
    false
  );

  fs.rmSync(
    tmp,
    {
      recursive:true,
      force:true
    }
  );

  console.log(
    'CIWU_OMEGA120_M505_M624_TESTS_PASS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
