'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const runtime=
  require('../../src/workbench/project-runtime-snapshot-v2');

const repository=
  require('../../src/workbench/repository-inventory-v2');

const symbols=
  require('../../src/workbench/symbol-index-v2');

const providers=
  require('../../src/workbench/provider-runtime-truth-v2');

const neurotex=
  require('../../src/workbench/neurotex-runtime-summary-v2');

const activity=
  require('../../src/workbench/certification-activity-v2');

const snapshot=runtime.snapshot(process.cwd());

assert.equal(snapshot.ok,true);
assert.equal(snapshot.project,'CIWU OMNI');
assert.equal(snapshot.mutationAuthority,false);
assert.equal(snapshot.gitPushAuthority,false);
assert.equal(snapshot.purchaseAuthority,false);

const inventory=repository.inventory(process.cwd());

assert.equal(inventory.ok,true);
assert.equal(inventory.readOnly,true);

assert.ok(
  inventory.entries.some(
    x => x.path === 'public/index.html'
  )
);

assert.equal(
  inventory.entries.some(
    x => x.path.includes('.ciwu-private')
  ),
  false
);

assert.equal(
  inventory.entries.some(
    x => x.path.includes('node_modules')
  ),
  false
);

const symbolIndex=symbols.build(
  process.cwd(),
  inventory.entries
);

assert.equal(symbolIndex.ok,true);
assert.ok(Number.isInteger(symbolIndex.symbolCount));

const providerTruth=providers.truth(process.cwd());

assert.equal(providerTruth.ok,true);
assert.equal(providerTruth.credentialsExposed,false);

for (const provider of providerTruth.providers) {
  assert.equal(
    provider.credentialValueExposed,
    false
  );
}

assert.equal(
  neurotex.scan(process.cwd()).ok,
  true
);

const activityState=
  activity.build(process.cwd());

assert.equal(activityState.ok,true);

assert.ok(
  activityState.events.some(
    event => event.milestoneEnd === 1824
  )
);

const router=fs.readFileSync(
  'src/routes/ciwu-workbench-readonly.js',
  'utf8'
);

for (const endpoint of [
  '/runtime',
  '/repository',
  '/symbols',
  '/providers',
  '/neurotex',
  '/activity'
]) {
  assert.match(
    router,
    new RegExp(
      endpoint.replace('/','\\/')
    )
  );
}

assert.match(router,/WORKBENCH_READ_ONLY/);

const enhanced=fs.readFileSync(
  'src/enhanced-api.js',
  'utf8'
);

assert.match(
  enhanced,
  /ciwu-workbench-readonly/
);

assert.match(
  enhanced,
  /\/api\/workbench/
);

const html=fs.readFileSync(
  'public/index.html',
  'utf8'
);

const client=fs.readFileSync(
  'public/ciwu-workbench-live.js',
  'utf8'
);

for (const token of [
  'ciwu-workbench-live.js',
  'ciwu-live-repository-tree',
  'ciwu-live-symbol-list',
  'ciwu-live-provider-grid',
  'ciwu-live-neurotex-list',
  'ciwu-live-activity'
]) {
  assert.match(
    html,
    new RegExp(token.replace('.','\\.'))
  );
}

assert.match(client,/\/api\/workbench/);

const release=JSON.parse(
  fs.readFileSync(
    'data/sovereign/omega120-m1825-m1944.json',
    'utf8'
  )
);

assert.equal(release.milestoneStart,1825);
assert.equal(release.milestoneEnd,1944);
assert.equal(release.milestoneCount,120);
assert.equal(release.productionAiMutation,false);
assert.equal(release.autonomousGitPush,false);
assert.equal(release.purchaseAuthority,false);
assert.equal(release.forcePush,false);

console.log(
  'CIWU_OMEGA120_M1825_M1944_TEST_PASS'
);
