'use strict';

const assert=
  require('node:assert/strict');

const fs=
  require('node:fs');

const repository=
  require('../../src/workbench/repository-inventory-v2');

const inspector=
  require('../../src/workbench/safe-file-inspector-v1');

const testRelationships=
  require('../../src/workbench/test-relationship-index-v1');

const releaseGraph=
  require('../../src/workbench/release-provenance-graph-v1');

const brain=
  require('../../src/workbench/project-brain-graph-v1');

const groundedSelector=
  require('../../src/workbench/grounded-context-selector-v1');

const citationEnvelope=
  require('../../src/workbench/source-citation-envelope-v1');

const regression=
  require('../../src/workbench/regression-plan-generator-v1');

const candidate=
  require('../../src/workbench/candidate-patch-plan-v1');

const root=process.cwd();

const protectedFile=
  'src/data/entities-batch1.json';

const inventory=
  repository.inventory(root);

assert.ok(
  Array.isArray(
    inventory.entries
  )
);

assert.equal(
  JSON.stringify(
    inventory.entries
  ).includes(
    protectedFile
  ),
  false
);

let directBlocked=false;

try {
  inspector.resolveSafe(
    root,
    protectedFile
  );
} catch (_) {
  directBlocked=true;
}

assert.equal(
  directBlocked,
  true
);

if (
  typeof inspector.inspectable ===
  'function'
) {
  assert.equal(
    inspector.inspectable(
      protectedFile
    ),
    false
  );
}

const tests=
  testRelationships.relationships(
    root,
    inventory.entries
  );

assert.equal(
  tests.ok,
  true
);

assert.equal(
  tests.readOnly,
  true
);

const releases=
  releaseGraph.build(root);

assert.equal(
  releases.ok,
  true
);

assert.equal(
  releases.readOnly,
  true
);

assert.ok(
  releases.nodeCount > 0
);

const graph=
  brain.build(root);

assert.equal(
  graph.ok,
  true
);

assert.equal(
  graph.readOnly,
  true
);

assert.equal(
  graph.schema,
  'CIWU_PROJECT_BRAIN_GRAPH_V1'
);

assert.ok(
  graph.nodeCount > 0
);

assert.equal(
  JSON.stringify(graph).includes(
    protectedFile
  ),
  false
);

const grounded=
  groundedSelector.select({
    root,
    files:[
      'data/frontend/project-intelligence-v1.json'
    ],
    symbols:[]
  });

assert.equal(
  grounded.ok,
  true
);

assert.equal(
  grounded.readOnly,
  true
);

assert.equal(
  grounded.grounded,
  true
);

assert.equal(
  grounded.mutationAuthority,
  false
);

assert.equal(
  grounded.executionAuthority,
  false
);

assert.equal(
  grounded.gitPushAuthority,
  false
);

assert.equal(
  grounded.purchaseAuthority,
  false
);

assert.ok(
  grounded.context
);

const citations=
  citationEnvelope.build(
    grounded
  );

assert.equal(
  citations.ok,
  true
);

assert.equal(
  citations.readOnly,
  true
);

assert.equal(
  citations.confidenceIsTruth,
  false
);

assert.equal(
  citations.citationIsAuthorization,
  false
);

const regressionPlan=
  regression.generate({
    root,
    files:[
      'src/workbench/project-brain-graph-v1.js'
    ]
  });

assert.equal(
  regressionPlan.ok,
  true
);

assert.equal(
  regressionPlan.readOnly,
  true
);

assert.equal(
  regressionPlan.planningOnly,
  true
);

assert.equal(
  regressionPlan.commandsExecuted,
  false
);

assert.equal(
  regressionPlan.executionAuthority,
  false
);

const patchPlan=
  candidate.plan({
    root,
    objective:
      'Review a hypothetical refactor without modifying production.',
    files:[
      'data/frontend/project-intelligence-v1.json'
    ],
    symbols:[]
  });

assert.equal(
  patchPlan.ok,
  true
);

assert.equal(
  patchPlan.readOnly,
  true
);

assert.equal(
  patchPlan.planningOnly,
  true
);

assert.equal(
  patchPlan.candidatePatchGenerated,
  false
);

assert.equal(
  patchPlan.candidatePatchApplied,
  false
);

assert.equal(
  patchPlan.productionMutation,
  false
);

assert.equal(
  patchPlan.shellExecution,
  false
);

assert.equal(
  patchPlan.gitCommit,
  false
);

assert.equal(
  patchPlan.gitPush,
  false
);

assert.equal(
  patchPlan.purchaseAuthority,
  false
);

assert.equal(
  patchPlan.requiresSeparateAuthorization,
  true
);

const router=
  fs.readFileSync(
    'src/routes/ciwu-workbench-readonly.js',
    'utf8'
  );

for (
  const route of [
    '/project-brain',
    '/grounded-context',
    '/regression-plan',
    '/candidate-patch-plan'
  ]
) {
  assert.ok(
    router.includes(route)
  );
}

const html=
  fs.readFileSync(
    'public/index.html',
    'utf8'
  );

assert.match(
  html,
  /ciwu-project-brain\.js/
);

const client=
  fs.readFileSync(
    'public/ciwu-project-brain.js',
    'utf8'
  );

assert.match(
  client,
  /PROJECT BRAIN/
);

assert.match(
  client,
  /Grounded Code Reasoning/
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m2065-m2184.json',
      'utf8'
    )
  );

assert.equal(
  release.generation,
  'OMEGA120_M2065_M2184'
);

assert.equal(
  release.marker,
  'CIWU_OMEGA120_M2065_M2184'
);

assert.equal(
  release.milestoneStart,
  2065
);

assert.equal(
  release.milestoneEnd,
  2184
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
  release.realProviderCallsDuringBuild,
  false
);

assert.equal(
  release.paidProviderCallsDuringBuild,
  false
);

assert.equal(
  release.productionAiMutation,
  false
);

assert.equal(
  release.arbitraryShellExecution,
  false
);

assert.equal(
  release.autonomousGitPush,
  false
);

assert.equal(
  release.purchaseAuthority,
  false
);

assert.equal(
  release.forcePush,
  false
);

console.log(
  'CIWU_OMEGA120_M2065_M2184_TEST_PASS'
);
