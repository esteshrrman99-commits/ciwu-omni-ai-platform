'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const path =
  require('node:path');

const env =
  require(
    '../../src/sovereign/providers/environment'
  );

const groq =
  require(
    '../../src/sovereign/federation/adapters/groq'
  );

const gemini =
  require(
    '../../src/sovereign/federation/adapters/gemini'
  );

const cloudflare =
  require(
    '../../src/sovereign/federation/adapters/cloudflare'
  );

const hf =
  require(
    '../../src/sovereign/federation/adapters/huggingface'
  );

const local =
  require(
    '../../src/sovereign/federation/adapters/local'
  );

const health =
  require(
    '../../src/sovereign/federation/health'
  );

const benchmark =
  require(
    '../../src/sovereign/federation/benchmark'
  );

const economic =
  require(
    '../../src/sovereign/eons/economic-router'
  );

const codex =
  require(
    '../../src/sovereign/codex/repository-index'
  );

const xeon =
  require(
    '../../src/sovereign/xeon/sandbox'
  );

const integration =
  require(
    '../../src/sovereign/integration/engine'
  );

const projectRoot =
  path.resolve(
    __dirname,
    '../..'
  );

const providerStatus =
  env.publicStatus();

assert.ok(
  providerStatus.groq
);

assert.equal(
  typeof groq.configured(),
  'boolean'
);

assert.equal(
  typeof gemini.configured(),
  'boolean'
);

assert.equal(
  typeof cloudflare.configured(),
  'boolean'
);

assert.equal(
  typeof hf.configured(),
  'boolean'
);

assert.equal(
  typeof local.configured(),
  'boolean'
);

assert.equal(
  health.classify({
    status: 429,
    message:
      'no credits remaining'
  }).state,
  'BILLING_BLOCKED'
);

const ranking =
  benchmark.rank([
    {
      provider: 'a',
      model: 'x',
      correctness: 0.9,
      testPassRate: 1,
      reasoningQuality: 0.8,
      codingQuality: 0.9,
      reliability: 0.9
    },
    {
      provider: 'b',
      model: 'y',
      correctness: 0.6,
      testPassRate: 0.5,
      reasoningQuality: 0.5,
      codingQuality: 0.6,
      reliability: 0.7
    }
  ]);

assert.equal(
  ranking[0].provider,
  'a'
);

const selected =
  economic.choose(
    [
      {
        id: 'free-good',
        available: true,
        verified: true,
        quality: 0.82,
        confidence: 0.9,
        informationGain: 0.8,
        testPassRate: 1,
        projectedCostUsd: 0
      },

      {
        id: 'paid-great',
        available: true,
        verified: true,
        quality: 0.99,
        confidence: 0.99,
        informationGain: 0.99,
        testPassRate: 1,
        projectedCostUsd: 1
      }
    ],
    {
      monthlySpentUsd: 0,
      monthlyCapUsd: 100,
      paidProviderAuthorized: false
    }
  );

assert.equal(
  selected.id,
  'free-good'
);

const index =
  codex.buildRepositoryIndex(
    projectRoot
  );

assert.ok(
  index.fileCount > 10
);

assert.ok(
  index.symbolCount > 0
);

const fixture =
  'test/sovereign/xeon-fixture.js';

fs.writeFileSync(
  path.join(
    projectRoot,
    fixture
  ),
  [
    "'use strict';",
    "const assert=require('node:assert/strict');",
    "assert.equal(2+2,4);",
    "console.log('XEON_FIXTURE_PASS');"
  ].join('\n')
);

let workspace;

try {
  workspace =
    xeon.createWorkspace({
      projectRoot,
      files: [fixture]
    });

  const check =
    xeon.execute({
      workspace,
      operation:
        'NODE_CHECK',
      file: fixture
    });

  assert.equal(
    check.passed,
    true
  );

  const run =
    xeon.execute({
      workspace,
      operation:
        'NODE_RUN',
      file: fixture
    });

  assert.equal(
    run.passed,
    true
  );

  assert.match(
    run.stdout,
    /XEON_FIXTURE_PASS/
  );

  assert.throws(
    () =>
      xeon.execute({
        workspace,
        operation:
          'SHELL',
        file: fixture
      }),
    /XEON_OPERATION_BLOCKED/
  );

} finally {
  if (workspace)
    xeon.destroy(workspace);

  fs.rmSync(
    path.join(
      projectRoot,
      fixture
    ),
    { force: true }
  );
}

const plan =
  integration.plan({
    task: {
      complexity: 0.4,
      risk: 0.2,
      novelty: 0.3
    },

    providerCandidates: [
      {
        id: 'verified-zero',
        available: true,
        verified: true,
        quality: 0.8,
        confidence: 0.9,
        informationGain: 0.8,
        testPassRate: 1,
        projectedCostUsd: 0
      }
    ],

    budget: {
      monthlySpentUsd: 0,
      monthlyCapUsd: 100,
      paidProviderAuthorized:
        false
    }
  });

assert.equal(
  plan.action,
  'ROUTE'
);

assert.equal(
  plan.provider.id,
  'verified-zero'
);

const blocked =
  integration.plan({
    task: {
      complexity: 1,
      risk: 1,
      novelty: 1
    },

    providerCandidates: [
      {
        id: 'unknown-cost',
        available: true,
        verified: true,
        quality: 1,
        confidence: 1,
        informationGain: 1,
        testPassRate: 1,
        projectedCostUsd:
          Number.NaN
      }
    ],

    budget: {
      monthlySpentUsd: 0,
      monthlyCapUsd: 100,
      paidProviderAuthorized:
        false
    }
  });

assert.equal(
  blocked.action,
  'ABSTAIN'
);

const status =
  integration.status();

assert.equal(
  status.state,
  'CORE_FEDERATION_READY'
);

assert.equal(
  status.boundaries.productionShell,
  false
);

assert.equal(
  status.boundaries.autonomousGitPush,
  false
);

console.log(
  'CIWU_SOVEREIGN_LEAP_024_TESTS_PASS'
);
