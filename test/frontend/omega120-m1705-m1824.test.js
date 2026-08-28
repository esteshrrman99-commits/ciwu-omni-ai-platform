'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const projects=
  require('../../src/frontend/project-workbench-state-v1');

const explorer=
  require('../../src/frontend/repository-explorer-v1');

const symbols=
  require('../../src/frontend/symbol-index-view-v1');

const conversations=
  require('../../src/frontend/m3-conversation-ledger-v1');

const providerCard=
  require('../../src/frontend/provider-truth-card-v1');

const diff=
  require('../../src/frontend/codex-diff-inspector-v1');

const xeon=
  require('../../src/frontend/xeon-sandbox-result-v1');

const evidence=
  require('../../src/frontend/neurotex-evidence-explorer-v1');

const timeline=
  require('../../src/frontend/activity-timeline-v1');

const project=
  projects.createProject({
    id:'ciwu',
    name:'CIWU OMNI',
    repository:'ciwu-omni-ai-platform'
  });

const projectState=
  projects.createState([project]);

assert.equal(
  projectState.activate('ciwu').ok,
  true
);

assert.equal(
  projectState.snapshot().activeId,
  'ciwu'
);

assert.throws(
  () => explorer.normalizeEntry({
    path:'../secret'
  }),
  /UNSAFE_REPOSITORY_PATH/
);

const tree=
  explorer.build([
    {path:'b.js',type:'file'},
    {path:'src',type:'directory'}
  ]);

assert.equal(
  tree[0].type,
  'directory'
);

const grouped=
  symbols.group([
    {
      name:'run',
      kind:'function',
      file:'src/a.js',
      line:2
    }
  ]);

assert.equal(
  grouped['src/a.js'][0].name,
  'run'
);

const ledger=
  conversations.create({
    projectId:'ciwu'
  });

ledger.append({
  role:'user',
  content:'Hello'
});

ledger.append({
  role:'assistant',
  content:'Ready'
});

assert.equal(
  ledger.snapshot().messages.length,
  2
);

const provider=
  providerCard.build({
    provider:'fixture',
    model:'model',
    configured:true,
    certified:false,
    runtimeEligible:false,
    health:'UNKNOWN',
    costClass:'UNKNOWN'
  });

assert.ok(
  provider.warnings.includes(
    'CONFIGURED_NOT_CERTIFIED'
  )
);

assert.ok(
  provider.warnings.includes(
    'UNKNOWN_COST'
  )
);

const inspected=
  diff.inspect({
    baseCommit:'abc',
    file:'a.js',
    diff:'--- a/a.js\n+++ b/a.js\n-old\n+new\n'
  });

assert.equal(
  inspected.addedLines,
  1
);

assert.equal(
  inspected.removedLines,
  1
);

assert.equal(
  inspected.productionMutation,
  false
);

const sandbox=
  xeon.normalize({
    command:'npm test',
    exitCode:0,
    timedOut:false,
    stdout:'pass',
    stderr:'',
    workspaceDestroyed:true
  });

assert.equal(
  sandbox.passed,
  true
);

const active=
  evidence.normalize({
    id:'e1',
    claim:'fixture',
    source:'test',
    confidence:0.9,
    provenanceValid:true,
    regressionValid:true
  });

assert.equal(
  active.state,
  'ACTIVE'
);

const quarantined=
  evidence.normalize({
    id:'e2',
    confidence:0.4
  });

assert.equal(
  quarantined.state,
  'QUARANTINED'
);

const events=
  timeline.order([
    {
      id:'1',
      timestamp:'2026-01-01T00:00:00Z'
    },
    {
      id:'2',
      timestamp:'2026-01-02T00:00:00Z'
    }
  ]);

assert.equal(
  events[0].id,
  '2'
);

const html=
  fs.readFileSync(
    'public/index.html',
    'utf8'
  );

const css=
  fs.readFileSync(
    'public/ciwu-omni.css',
    'utf8'
  );

const js=
  fs.readFileSync(
    'public/ciwu-workbench.js',
    'utf8'
  );

assert.match(
  html,
  /Project Workbench/
);

assert.match(
  html,
  /Repository Explorer/i
);

assert.match(
  html,
  /NEUROTEX EVIDENCE EXPLORER/
);

assert.match(
  html,
  /XEON SANDBOX RESULTS/
);

assert.match(
  html,
  /ACTIVITY TIMELINE/
);

assert.match(
  html,
  /\/ciwu-workbench\.js/
);

assert.match(
  css,
  /\.ciwu-workbench/
);

assert.match(
  js,
  /localStorage/
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1705-m1824.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneStart,
  1705
);

assert.equal(
  release.milestoneEnd,
  1824
);

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.interactiveWorkbench,
  true
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
  release.autonomousGitPush,
  false
);

assert.equal(
  release.autonomousPurchase,
  false
);

assert.equal(
  release.forcePush,
  false
);

console.log(
  'CIWU_OMEGA120_M1705_M1824_TEST_PASS'
);
