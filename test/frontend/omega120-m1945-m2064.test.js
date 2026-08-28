'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const inspector=
  require('../../src/workbench/safe-file-inspector-v1');

const search=
  require('../../src/workbench/project-search-v1');

const drill=
  require('../../src/workbench/symbol-drilldown-v1');

const dependencies=
  require('../../src/workbench/dependency-graph-v1');

const releases=
  require('../../src/workbench/release-comparator-v1');

const evidence=
  require('../../src/workbench/evidence-drilldown-v1');

const context=
  require('../../src/workbench/m3-context-assembler-v1');

const repository=
  require('../../src/workbench/repository-inventory-v2');

const root=process.cwd();

assert.throws(
  () => inspector.normalize('../secret'),
  /PATH_TRAVERSAL_BLOCKED/
);

assert.throws(
  () => inspector.normalize('/etc/passwd'),
  /INVALID_FILE_PATH/
);

assert.equal(
  inspector.inspectable(
    'public/index.html'
  ),
  true
);

assert.equal(
  inspector.inspectable(
    '.ciwu-private/a.json'
  ),
  false
);

assert.equal(
  inspector.inspectable(
    'src/.env'
  ),
  false
);

const file=
  inspector.inspect(
    root,
    'public/index.html'
  );

assert.equal(file.ok,true);
assert.equal(file.readOnly,true);
assert.ok(file.bytes > 0);
assert.ok(file.lineCount > 0);

const inventory=
  repository.inventory(root);

const searchResult=
  search.search(
    root,
    inventory.entries,
    'CIWU'
  );

assert.equal(searchResult.ok,true);
assert.equal(searchResult.readOnly,true);
assert.ok(
  searchResult.resultCount > 0
);

const symbolCandidate={
  name:'normalize',
  kind:'function',
  file:
    'src/workbench/safe-file-inspector-v1.js',
  line:46
};

const symbolsSource=
  fs.readFileSync(
    symbolCandidate.file,
    'utf8'
  ).split(/\r?\n/);

const actualLine=
  symbolsSource.findIndex(
    line =>
      line.includes(
        'function normalize'
      )
  ) + 1;

symbolCandidate.line=actualLine;

const symbol=
  drill.locate(
    root,
    symbolCandidate
  );

assert.equal(symbol.ok,true);
assert.equal(symbol.readOnly,true);
assert.ok(
  symbol.context.some(
    line => line.target === true
  )
);

const graph=
  dependencies.build(
    root,
    inventory.entries
  );

assert.equal(graph.ok,true);
assert.equal(graph.readOnly,true);
assert.ok(
  Number.isInteger(
    graph.nodeCount
  )
);

assert.ok(
  Number.isInteger(
    graph.edgeCount
  )
);

const releaseList=
  releases.loadReleases(root);

assert.ok(
  releaseList.some(
    item =>
      item.data.milestoneEnd === 1944
  )
);

const evidenceRecord=
  evidence.read(
    root,
    'data/sovereign/omega120-m1825-m1944.json'
  );

assert.equal(
  evidenceRecord.ok,
  true
);

assert.equal(
  evidenceRecord.milestoneEnd,
  1944
);

const assembled=
  context.assemble({
    root,
    files:[
      'public/index.html'
    ],
    symbols:[]
  });

assert.equal(assembled.ok,true);
assert.equal(assembled.readOnly,true);
assert.equal(
  assembled.mutationAuthority,
  false
);
assert.equal(
  assembled.executionAuthority,
  false
);
assert.equal(
  assembled.gitPushAuthority,
  false
);
assert.equal(
  assembled.purchaseAuthority,
  false
);
assert.ok(
  assembled.approximateChars <=
  assembled.maxChars
);

const router=
  fs.readFileSync(
    'src/routes/ciwu-workbench-readonly.js',
    'utf8'
  );

for (const token of [
  "/file",
  "/search",
  "/symbol",
  "/dependencies",
  "/releases",
  "/release-compare",
  "/evidence-record",
  "/context-assemble"
]) {
  assert.ok(
    router.includes(token),
    `missing ${token}`
  );
}

const html=
  fs.readFileSync(
    'public/index.html',
    'utf8'
  );

assert.match(
  html,
  /ciwu-project-intelligence\.js/
);

const client=
  fs.readFileSync(
    'public/ciwu-project-intelligence.js',
    'utf8'
  );

assert.match(
  client,
  /PROJECT INTELLIGENCE/
);

assert.match(
  client,
  /context-assemble/
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1945-m2064.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1945
);

assert.equal(
  release.milestoneEnd,
  2064
);

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.arbitraryFilesystemAccess,
  false
);

assert.equal(
  release.arbitraryShellExecution,
  false
);

assert.equal(
  release.productionAiMutation,
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
  'CIWU_OMEGA120_M1945_M2064_TEST_PASS'
);
