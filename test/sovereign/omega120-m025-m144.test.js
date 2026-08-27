'use strict';

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const catalog =
  require(
    '../../src/sovereign/provider-control/catalog'
  );

const truth =
  require(
    '../../src/sovereign/provider-control/truth'
  );

const {
  CircuitBreaker
} = require(
  '../../src/sovereign/provider-control/circuit-breaker'
);

const fallback =
  require(
    '../../src/sovereign/provider-control/fallback'
  );

const scorer =
  require(
    '../../src/sovereign/evaluation/scorer'
  );

const leaderboard =
  require(
    '../../src/sovereign/evaluation/leaderboard'
  );

const regression =
  require(
    '../../src/sovereign/evaluation/regression'
  );

const {
  SpendLedger
} = require(
    '../../src/sovereign/eons/ledger'
  );

const valueRouter =
  require(
    '../../src/sovereign/eons/value-router'
  );

const context =
  require(
    '../../src/sovereign/codex/context-engine'
  );

const dep =
  require(
    '../../src/sovereign/codex/dependency-graph'
  );

const testMap =
  require(
    '../../src/sovereign/codex/test-map'
  );

const impact =
  require(
    '../../src/sovereign/codex/change-impact'
  );

const patch =
  require(
    '../../src/sovereign/xeon/patch-engine'
  );

const {
  repairLoop
} = require(
    '../../src/sovereign/xeon/repair-loop'
  );

const {
  POLICY
} = require(
    '../../src/sovereign/xeon/policy'
  );

const {
  PersistentMemory
} = require(
    '../../src/sovereign/neurotex/persistent-memory'
  );

const conflict =
  require(
    '../../src/sovereign/neurotex/conflict'
  );

const confidence =
  require(
    '../../src/sovereign/neurotex/confidence'
  );

const {
  ProjectGraph
} = require(
    '../../src/sovereign/project-brain/graph'
  );

const {
  redact
} = require(
    '../../src/sovereign/security/redaction'
  );

const {
  event
} = require(
    '../../src/sovereign/observability/event-log'
  );

const hashChain =
  require(
    '../../src/sovereign/observability/hash-chain'
  );

const {
  certify
} = require(
    '../../src/sovereign/release/certification'
  );

assert.ok(
  Array.isArray(
    catalog.allStates()
  )
);

const geminiSpec =
  catalog.ENVIRONMENT.gemini;

assert.deepEqual(
  geminiSpec.requiredAny,
  [
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY'
  ]
);

assert.equal(
  truth.classify({
    configured: false
  }),
  'UNCONFIGURED'
);

assert.equal(
  truth.classify({
    configured: true,
    status: 429,
    message:
      'credits exhausted'
  }),
  'BILLING_BLOCKED'
);

assert.equal(
  truth.fallbackEligible(
    'BILLING_BLOCKED'
  ),
  true
);

const cb =
  new CircuitBreaker({
    threshold: 2,
    cooldownMs: 100
  });

assert.equal(
  cb.status('p',0),
  'CLOSED'
);

cb.recordFailure('p',0);
cb.recordFailure('p',0);

assert.equal(
  cb.status('p',1),
  'OPEN'
);

assert.equal(
  cb.status('p',101),
  'HALF_OPEN'
);

assert.equal(
  cb.recordSuccess('p'),
  'CLOSED'
);

const ordered =
  fallback.order([
    {
      id:'paid',
      available:true,
      verified:true,
      projectedCostUsd:1,
      quality:1,
      reliability:1
    },
    {
      id:'free',
      available:true,
      verified:true,
      projectedCostUsd:0,
      quality:0.8,
      reliability:0.9
    }
  ]);

assert.equal(
  ordered[0].id,
  'free'
);

assert.equal(
  scorer.score({
    correctness:1,
    testPassRate:1,
    reasoning:1,
    coding:1,
    reliability:1,
    safety:1
  }),
  1
);

const board =
  leaderboard.rank([
    {
      provider:'a',
      correctness:1,
      testPassRate:1,
      reasoning:1,
      coding:1,
      reliability:1,
      safety:1
    },
    {
      provider:'b',
      correctness:0.5,
      testPassRate:0.5,
      reasoning:0.5,
      coding:0.5,
      reliability:0.5,
      safety:0.5
    }
  ]);

assert.equal(
  board[0].provider,
  'a'
);

assert.equal(
  regression.compare(
    0.9,
    0.7
  ).regressed,
  true
);

const ledger =
  new SpendLedger({
    monthlyCapUsd:100
  });

ledger.record({
  provider:'free',
  model:'x',
  amountUsd:0,
  authorized:false
});

assert.equal(
  ledger.total(),
  0
);

assert.throws(
  () =>
    ledger.record({
      provider:'paid',
      model:'x',
      amountUsd:1,
      authorized:false
    }),
  /PAID_SPEND_NOT_AUTHORIZED/
);

assert.equal(
  ledger.projected(101)
    .allowed,
  false
);

const chosen =
  valueRouter.select(
    [
      {
        id:'free',
        available:true,
        verified:true,
        quality:0.8,
        confidence:0.9,
        informationGain:0.8,
        testPassRate:1,
        reliability:0.9,
        projectedCostUsd:0
      },
      {
        id:'paid',
        available:true,
        verified:true,
        quality:1,
        confidence:1,
        informationGain:1,
        testPassRate:1,
        reliability:1,
        projectedCostUsd:1
      }
    ],
    {
      paidAuthorized:false
    }
  );

assert.equal(
  chosen.id,
  'free'
);

const projectRoot =
  path.resolve(
    __dirname,
    '../..'
  );

assert.ok(
  context.retrieve(
    projectRoot,
    'sovereign',
    { topK:3 }
  ).length > 0
);

const graphIndex =
  dep.graph({
    files:[
      {
        path:'src/a.js',
        imports:['./b']
      }
    ]
  });

assert.equal(
  graphIndex.edges.length,
  1
);

const mappings =
  testMap.mapTests({
    files:[
      {
        path:'src/a.js',
        test:false
      },
      {
        path:'test/a.test.js',
        test:true
      }
    ]
  });

const affected =
  impact.affected({
    changedFiles:[
      'src/a.js'
    ],
    dependencyGraph:{
      edges:[]
    },
    testMap:mappings
  });

assert.ok(
  affected.impacted
    .includes('src/a.js')
);

const temp =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-patch-test-'
    )
  );

try {
  fs.writeFileSync(
    path.join(
      temp,
      'a.js'
    ),
    'const x = 1;\n'
  );

  patch.replace({
    workspace:temp,
    file:'a.js',
    before:'1',
    after:'2'
  });

  assert.match(
    fs.readFileSync(
      path.join(
        temp,
        'a.js'
      ),
      'utf8'
    ),
    /2/
  );

  assert.throws(
    () =>
      patch.safe(
        temp,
        '../escape'
      ),
    /PATH_ESCAPE/
  );
}
finally {
  fs.rmSync(
    temp,
    {
      recursive:true,
      force:true
    }
  );
}

(async () => {
  let attempts = 0;

  const repair =
    await repairLoop({
      maxAttempts:3,

      propose:
        async () => ({
          patch:
            ++attempts
        }),

      apply:
        async proposal =>
          proposal,

      test:
        async () => ({
          passed:
            attempts >= 2
        })
    });

  assert.equal(
    repair.passed,
    true
  );

  assert.equal(
    repair.attempts,
    2
  );

  assert.equal(
    POLICY.arbitraryShell,
    false
  );

  const memoryFile =
    path.join(
      os.tmpdir(),
      `ciwu-memory-${Date.now()}.jsonl`
    );

  try {
    const memory =
      new PersistentMemory(
        memoryFile
      );

    memory.append({
      type:'FACT',
      content:
        'CVE-QN is active',
      provenance:'test',
      confidence:1,
      tags:['kernel']
    });

    assert.equal(
      memory.search(
        'kernel'
      ).length,
      1
    );
  }
  finally {
    fs.rmSync(
      memoryFile,
      { force:true }
    );
  }

  assert.equal(
    conflict.detect([
      {
        type:'FACT',
        key:'x',
        content:'a'
      },
      {
        type:'FACT',
        key:'x',
        content:'b'
      }
    ]).length,
    1
  );

  const fused =
    confidence.fuseIndependent([
      {
        sourceGroup:'A',
        confidence:0.8
      },
      {
        sourceGroup:'A',
        confidence:0.7
      },
      {
        sourceGroup:'B',
        confidence:0.5
      }
    ]);

  assert.ok(
    fused > 0.8 &&
    fused <= 1
  );

  const graph =
    new ProjectGraph();

  graph.addNode({
    id:'a',
    type:'FILE'
  });

  graph.addNode({
    id:'b',
    type:'SYMBOL'
  });

  graph.addEdge({
    from:'a',
    to:'b',
    type:'DECLARES',
    evidence:'a.js'
  });

  assert.equal(
    graph.neighbors('a')
      .length,
    1
  );

  assert.equal(
    redact(
      'Bearer abcdefghijklmnopqrstuvwxyz'
    ),
    '[REDACTED]'
  );

  const chained =
    hashChain.chain([
      event({
        type:'TEST',
        component:'XEON',
        outcome:'PASS'
      }),

      event({
        type:'TEST',
        component:'CODEX',
        outcome:'PASS'
      })
    ]);

  assert.equal(
    hashChain.verify(
      chained
    ),
    true
  );

  const certification =
    certify({
      genesis:true,
      leap024:true,
      omega120:true,
      budget:true,
      security:true
    });

  assert.equal(
    certification.passed,
    true
  );

  const ledgerData =
    JSON.parse(
      fs.readFileSync(
        'data/sovereign/omega120-m025-m144.json',
        'utf8'
      )
    );

  assert.equal(
    ledgerData.milestoneCount,
    120
  );

  assert.equal(
    ledgerData.milestoneStart,
    25
  );

  assert.equal(
    ledgerData.milestoneEnd,
    144
  );

  assert.equal(
    ledgerData.monthlyHardCapUsd,
    100
  );

  assert.equal(
    ledgerData.monthlyRequiredSpendUsd,
    0
  );

  console.log(
    'CIWU_OMEGA120_M025_M144_TESTS_PASS'
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
