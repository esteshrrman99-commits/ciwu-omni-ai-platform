'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const session =
  require(
    '../../src/sovereign/provider-runtime/certification-session-v3'
  );

const transitions =
  require(
    '../../src/sovereign/provider-runtime/session-transitions-v3'
  );

const receipt =
  require(
    '../../src/sovereign/provider-runtime/certification-receipt-v3'
  );

const store =
  require(
    '../../src/sovereign/provider-runtime/private-evidence-store-v2'
  );

const orchestrator =
  require(
    '../../src/sovereign/provider-runtime/certification-orchestrator-v2'
  );

const failures =
  require(
    '../../src/sovereign/provider-runtime/failure-normalizer-v4'
  );

const benchmark =
  require(
    '../../src/sovereign/benchmark/persistent-score-v3'
  );

const admission =
  require(
    '../../src/sovereign/provider-runtime/runtime-admission-v6'
  );

const queue =
  require(
    '../../src/sovereign/codex/certified-repair-queue-v2'
  );

const approval =
  require(
    '../../src/sovereign/github/approval-token-v3'
  );

(async () => {

  const created =
    session.create({
      provider:
        'mock',
      model:
        'mock-model',
      costClass:
        'ZERO_VERIFIED',
      priceEvidenceHash:
        'price-hash',
      maximumCostUsd:
        0
    });

  assert.equal(
    session.verifyNonce(
      created.session,
      created.nonce
    ),
    true
  );

  assert.equal(
    transitions.transition(
      'AUTHORIZED_NOT_EXECUTED',
      'START'
    ),
    'EXECUTING'
  );

  assert.throws(
    () =>
      transitions.transition(
        'COMPLETED_SUCCESS',
        'START'
      ),
    /ILLEGAL_CERTIFICATION_TRANSITION/
  );

  const certReceipt =
    receipt.create({
      session:
        created.session,
      nonce:
        created.nonce,
      requestHash:
        'req',
      responseHash:
        'resp',
      statusCode:
        200,
      latencyMs:
        12,
      observedCostUsd:
        0,
      realNetworkCall:
        true
    });

  assert.equal(
    receipt.verify(
      certReceipt
    ),
    true
  );

  const root =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-evidence-'
      )
    );

  const evidenceStore =
    store.createStore(root);

  evidenceStore.write(
    'receipt-1',
    certReceipt
  );

  const loaded =
    evidenceStore.read(
      'receipt-1'
    );

  assert.equal(
    loaded.receiptHash,
    certReceipt.receiptHash
  );

  const denied =
    await orchestrator.execute({
      session:
        created.session,
      nonce:
        created.nonce,
      explicitAuthorization:
        false,
      adapter:
        async () => ({
          ok:true
        }),
      request:
        'test'
    });

  assert.equal(
    denied.executed,
    false
  );

  let adapterCalls = 0;

  const executed =
    await orchestrator.execute({
      session:
        created.session,
      nonce:
        created.nonce,
      explicitAuthorization:
        true,

      adapter:
        async () => {
          adapterCalls += 1;

          return {
            ok:true,
            statusCode:200
          };
        },

      request:
        'fixture'
    });

  assert.equal(
    executed.executed,
    true
  );

  assert.equal(
    adapterCalls,
    1
  );

  assert.equal(
    failures.classify({
      statusCode:
        429,
      message:
        'billing credits exhausted'
    }),
    'BILLING_OR_QUOTA_BLOCKED'
  );

  assert.equal(
    failures.classify({
      statusCode:
        429,
      message:
        'too many requests'
    }),
    'RATE_LIMITED'
  );

  assert.equal(
    failures.classify({
      timeout:true
    }),
    'TIMEOUT'
  );

  assert.equal(
    failures.fallbackAllowed(
      'BILLING_OR_QUOTA_BLOCKED'
    ),
    true
  );

  const score =
    benchmark.create({
      provider:
        'mock',
      model:
        'mock-model',
      taskId:
        'task-1',
      quality:
        0.9,
      latencyScore:
        0.8,
      reliability:
        0.95,
      costScore:
        1,
      receiptHash:
        certReceipt.receiptHash
    });

  assert.ok(
    score.score >
    0.8
  );

  assert.ok(
    score.benchmarkHash
  );

  const admitted =
    admission.evaluate({
      providerCertified:
        true,
      receiptVerified:
        true,
      benchmarkVerified:
        true,
      priceFresh:
        true,
      costReconciled:
        true,
      circuitOpen:
        false,
      evidenceStale:
        false,
      benchmarkScore:
        score.score,
      minimumScore:
        0.7
    });

  assert.equal(
    admitted.admitted,
    true
  );

  const blocked =
    admission.evaluate({
      providerCertified:
        true,
      receiptVerified:
        true,
      benchmarkVerified:
        true,
      priceFresh:
        false,
      costReconciled:
        true,
      circuitOpen:
        false,
      evidenceStale:
        false,
      benchmarkScore:
        0.9
    });

  assert.equal(
    blocked.admitted,
    false
  );

  const queued =
    queue.enqueue({
      task:{
        type:
          'REPAIR'
      },

      providerEntry:{
        runtimeEligible:
          true,
        provider:
          'mock',
        model:
          'mock-model'
      },

      contextHash:
        'context-hash',

      evidenceHash:
        certReceipt.receiptHash
    });

  assert.equal(
    queued.state,
    'QUEUED_FOR_SANDBOX_ONLY'
  );

  assert.equal(
    queued.productionMutation,
    false
  );

  const completed =
    queue.complete(
      queued,
      {
        sandboxCertified:
          true,
        regressionPassed:
          true,
        repairEvidenceHash:
          'repair-hash'
      }
    );

  assert.equal(
    completed.certified,
    true
  );

  const baseCommit =
    'a'.repeat(40);

  const token =
    approval.issue({
      intentHash:
        'intent-hash',

      baseCommit,

      expiresAt:
        new Date(
          Date.now() +
          60000
        ).toISOString()
    });

  const verified =
    approval.verify({
      token,
      intentHash:
        'intent-hash',
      currentBaseCommit:
        baseCommit
    });

  assert.equal(
    verified.valid,
    true
  );

  const consumed =
    approval.consume(
      token
    );

  assert.equal(
    consumed.used,
    true
  );

  assert.throws(
    () =>
      approval.consume(
        consumed
      ),
    /APPROVAL_TOKEN_REPLAY/
  );

  const ledger =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m865-m984.json',
        'utf8'
      )
    );

  assert.equal(
    ledger.milestoneStart,
    865
  );

  assert.equal(
    ledger.milestoneEnd,
    984
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
    'CIWU_OMEGA120_M865_M984_TESTS_PASS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
