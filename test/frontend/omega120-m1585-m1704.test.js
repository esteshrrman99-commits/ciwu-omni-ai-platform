'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

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
    'public/ciwu-omni-app.js',
    'utf8'
  );

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m1585-m1704.json',
      'utf8'
    )
  );

assert.match(
  html,
  /CIWU OMNI/
);

assert.match(
  html,
  /Command Center/
);

assert.match(
  html,
  /M3 Sovereign Intelligence/
);

assert.match(
  html,
  /Model Federation/
);

assert.match(
  html,
  /Code Intelligence Workspace/
);

assert.match(
  html,
  /NEUROTEX Evidence Memory/
);

assert.match(
  html,
  /Safety & Authorization Plane/
);

assert.match(
  html,
  /\/ciwu-omni\.css/
);

assert.match(
  html,
  /\/ciwu-omni-app\.js/
);

assert.match(
  css,
  /@media \(max-width: 760px\)/
);

assert.match(
  css,
  /\.ciwu-chat-layout/
);

assert.match(
  js,
  /\/api\/sovereign\/health/
);

assert.match(
  js,
  /\/api\/m3\/health/
);

assert.match(
  js,
  /\/api\/m3\/chat/
);

assert.equal(
  release.milestoneStart,
  1585
);

assert.equal(
  release.milestoneEnd,
  1704
);

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.focus,
  'FRONTEND_GENESIS'
);

assert.equal(
  release.commandCenter,
  true
);

assert.equal(
  release.m3Workspace,
  true
);

assert.equal(
  release.federationWorkspace,
  true
);

assert.equal(
  release.codeWorkspace,
  true
);

assert.equal(
  release.neurotexWorkspace,
  true
);

assert.equal(
  release.safetyWorkspace,
  true
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
  release.autonomousPurchase,
  false
);

assert.equal(
  release.forcePush,
  false
);

console.log(
  "CIWU_FRONTEND_GENESIS_M1585_M1704_TEST_PASS"
);
