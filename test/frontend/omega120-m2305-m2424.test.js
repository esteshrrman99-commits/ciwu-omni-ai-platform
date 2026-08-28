'use strict';

const assert=
  require('node:assert/strict');

const fs=
  require('node:fs');

const searchPolicy=
  require('../../src/workbench/autonomous-repair-search-policy-v1');

const selector=
  require('../../src/workbench/impact-aware-test-selector-v1');

const enumerator=
  require('../../src/workbench/repair-candidate-enumerator-v1');

const orchestrator=
  require('../../src/workbench/multi-candidate-sandbox-orchestrator-v1');

const classifier=
  require('../../src/workbench/repair-failure-classifier-v1');

const ranker=
  require('../../src/workbench/evidence-weighted-repair-ranker-v1');

const fusion=
  require('../../src/workbench/repair-evidence-fusion-v1');

const handoff=
  require('../../src/workbench/human-review-handoff-v1');

const file=
  'test/frontend/xeon-sandbox-fixture.js';

const original=
  fs.readFileSync(
    file,
    'utf8'
  );

assert.equal(
  searchPolicy.MAX_CANDIDATES,
  8
);

const selected=
  selector.select({
    changedFiles:[file],
    candidateTests:[file]
  });

assert.equal(
  selected.ok,
  true
);

assert.equal(
  selected.selectionCount,
  1
);

const enumerated=
  enumerator.enumerate({
    objective:
      'Bounded autonomous sandbox repair search.',
    candidates:[
      {
        label:'literal 42',
        operation:{
          type:'replace_exact',
          file,
          before:'return 40 + 2;',
          after:'return 42;'
        }
      },
      {
        label:'equivalent 41 plus 1',
        operation:{
          type:'replace_exact',
          file,
          before:'return 40 + 2;',
          after:'return 41 + 1;'
        }
      },
      {
        label:'intentional fail',
        operation:{
          type:'replace_exact',
          file,
          before:'return 40 + 2;',
          after:'return 41;'
        }
      }
    ]
  });

assert.equal(
  enumerated.candidateCount,
  3
);

const search=
  orchestrator.run({
    root:process.cwd(),
    sourceFiles:[],
    tests:[file],
    candidates:
      enumerated.candidates
  });

assert.equal(
  search.ok,
  true
);

assert.equal(
  search.attemptCount,
  3
);

assert.equal(
  search.productionMutation,
  false
);

const classifications=
  classifier.classify(
    search.attempts
  );

assert.equal(
  classifications.ok,
  true
);

assert.equal(
  classifications.classificationCount,
  3
);

const ranking=
  ranker.rank(
    search.attempts
  );

assert.equal(
  ranking.ok,
  true
);

assert.equal(
  ranking.best.verified,
  true
);

assert.equal(
  ranking.confidenceIsTruth,
  false
);

assert.equal(
  ranking.optimizationIsAuthorization,
  false
);

const evidence=
  fusion.fuse({
    search,
    classifications,
    ranking
  });

assert.equal(
  evidence.ok,
  true
);

assert.ok(
  evidence.evidenceHash
);

assert.equal(
  evidence.evidence.confidenceIsTruth,
  false
);

const review=
  handoff.build({
    objective:
      'Bounded autonomous sandbox repair search.',
    selectedTests:
      selected.selectedTests,
    ranking,
    classifications,
    evidence
  });

assert.equal(
  review.ok,
  true
);

assert.equal(
  review.humanReviewRequired,
  true
);

assert.equal(
  review.productionApplyAuthorized,
  false
);

assert.equal(
  review.gitCommitAuthorized,
  false
);

assert.equal(
  review.gitPushAuthorized,
  false
);

assert.equal(
  review.deploymentAuthorized,
  false
);

assert.equal(
  review.purchaseAuthorized,
  false
);

assert.equal(
  fs.readFileSync(
    file,
    'utf8'
  ),
  original
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m2305-m2424.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.productionMutation,
  false
);

assert.equal(
  release.arbitraryShell,
  false
);

assert.equal(
  release.gitPushAuthority,
  false
);

assert.equal(
  release.confidenceIsTruth,
  false
);

assert.equal(
  release.optimizationIsAuthorization,
  false
);

console.log(
  'CIWU_OMEGA120_M2305_M2424_TEST_PASS'
);
