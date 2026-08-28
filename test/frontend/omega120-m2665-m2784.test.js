'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const locator=
  require('../../src/workbench/original-platform-history-locator-v1');

const snapshots=
  require('../../src/workbench/historical-frontend-snapshot-index-v1');

const routes=
  require('../../src/workbench/original-route-page-inventory-v1');

const features=
  require('../../src/workbench/original-feature-ledger-v1');

const ui=
  require('../../src/workbench/original-ui-dna-v1');

const drift=
  require('../../src/workbench/platform-drift-detector-v1');

const fusion=
  require('../../src/workbench/sovereign-fusion-mapper-v1');

const blueprint=
  require('../../src/workbench/original-platform-recovery-blueprint-v1');

const location=
  locator.locate();

assert.ok(
  location.originalCandidate?.sha
);

assert.match(
  location.originalCandidate.sha,
  /^[0-9a-f]{40}$/
);

assert.equal(
  location.mutationPerformed,
  false
);

const index=
  snapshots.build();

assert.ok(
  index.count >= 1
);

const original=
  locator.showFile(
    location.originalCandidate.sha,
    'public/index.html'
  );

assert.equal(
  typeof original,
  'string'
);

const current=
  fs.readFileSync(
    'public/index.html',
    'utf8'
  );

const originalRoutes=
  routes.build(original);

const currentRoutes=
  routes.build(current);

const ledger=
  features.ledger({
    originalContent:original,
    currentContent:current
  });

assert.ok(
  Array.isArray(
    ledger.comparison
  )
);

const originalUi=
  ui.extract(original);

const currentUi=
  ui.extract(current);

const driftReport=
  drift.detect({
    originalRoutes,
    currentRoutes,
    featureLedger:ledger,
    originalUi,
    currentUi
  });

assert.equal(
  driftReport.automaticRestore,
  false
);

const fusionMap=
  fusion.build({
    originalFeatures:
      ledger.comparison,
    drift:driftReport
  });

assert.equal(
  fusionMap.principles
    .preserveCurrentIntelligence,
  true
);

assert.equal(
  fusionMap.principles
    .preserveOriginalProductIdentity,
  true
);

const report=JSON.parse(
  fs.readFileSync(
    'data/forensics/original-platform-forensic-v1.json',
    'utf8'
  )
);

const recovery=
  blueprint.build(report);

assert.equal(
  recovery.defaultPublicTarget,
  'ORIGINAL_PLATFORM_EXPERIENCE'
);

assert.equal(
  recovery.sovereignAdminTarget,
  'CURRENT_COMMAND_CENTER'
);

assert.equal(
  recovery.deleteCurrentCommandCenter,
  false
);

assert.equal(
  recovery.overwriteCurrentFrontendNow,
  false
);

const release=JSON.parse(
  fs.readFileSync(
    'data/sovereign/omega120-m2665-m2784.json',
    'utf8'
  )
);

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.originalUiRestored,
  false
);

assert.equal(
  release.currentUiOverwritten,
  false
);

assert.equal(
  release.commandCenterPreserved,
  true
);

console.log(
  'CIWU_OMEGA120_M2665_M2784_TEST_PASS'
);
