'use strict';

const assert=
  require('node:assert/strict');

const fs=require('node:fs');

const policy=
  require('../../src/workbench/xeon-sandbox-policy-v1');

const workspace=
  require('../../src/workbench/xeon-workspace-builder-v1');

const generator=
  require('../../src/workbench/codex-structured-patch-generator-v1');

const applier=
  require('../../src/workbench/xeon-sandbox-patch-applier-v1');

const validator=
  require('../../src/workbench/xeon-sandbox-validator-v1');

const comparator=
  require('../../src/workbench/xeon-repair-comparator-v1');

const decision=
  require('../../src/workbench/verified-repair-decision-v1');

const evidence=
  require('../../src/workbench/xeon-repair-evidence-v1');

let blocked=false;

try {
  policy.assertSafeRelative(
    'src/data/entities-batch1.json'
  );
} catch (_) {
  blocked=true;
}

assert.equal(
  blocked,
  true
);

const selected=
  'test/frontend/xeon-sandbox-fixture.js';

const original=
  fs.readFileSync(
    selected,
    'utf8'
  );

const box=
  workspace.build({
    root:process.cwd(),
    files:[selected]
  });

try {
  const generated=
    generator.generate({
      objective:
        'Sandbox-only deterministic equivalent refactor.',
      operations:[
        {
          type:'replace_exact',
          file:selected,
          before:'return 40 + 2;',
          after:'return 42;'
        }
      ]
    });

  assert.equal(
    generated.candidatePatchGenerated,
    true
  );

  assert.equal(
    generated.candidate.sandboxOnly,
    true
  );

  const baseline=
    validator.validate({
      workspace:box.workspace,
      checks:[
        {
          file:selected,
          mode:'check'
        },
        {
          file:selected,
          mode:'test'
        }
      ]
    });

  assert.equal(
    baseline.ok,
    true
  );

  const applied=
    applier.apply({
      workspace:box.workspace,
      candidate:
        generated.candidate
    });

  assert.equal(
    applied.applied,
    true
  );

  assert.equal(
    applied.productionMutation,
    false
  );

  const after=
    validator.validate({
      workspace:box.workspace,
      checks:[
        {
          file:selected,
          mode:'check'
        },
        {
          file:selected,
          mode:'test'
        }
      ]
    });

  assert.equal(
    after.ok,
    true
  );

  assert.equal(
    after.arbitraryShell,
    false
  );

  assert.equal(
    after.productionExecution,
    false
  );

  const compared=
    comparator.compare({
      baseline:
        baseline.results,
      candidate:
        after.results
    });

  assert.equal(
    compared.regressionCount,
    0
  );

  assert.equal(
    compared.candidateAcceptable,
    true
  );

  const verdict=
    decision.decide({
      patch:applied,
      validation:after,
      comparison:compared
    });

  assert.equal(
    verdict.verified,
    true
  );

  assert.equal(
    verdict.productionApplyAuthorized,
    false
  );

  assert.equal(
    verdict.gitCommitAuthorized,
    false
  );

  assert.equal(
    verdict.gitPushAuthorized,
    false
  );

  assert.equal(
    verdict.deploymentAuthorized,
    false
  );

  const bundle=
    evidence.build({
      patchId:
        generated.patchId,
      workspaceManifest:
        box.manifest,
      applyResult:applied,
      validation:after,
      comparison:compared,
      decision:verdict
    });

  assert.equal(
    bundle.ok,
    true
  );

  assert.ok(
    bundle.evidenceHash
  );

} finally {
  workspace.destroy(
    box.workspace
  );
}

assert.equal(
  fs.readFileSync(
    selected,
    'utf8'
  ),
  original
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m2185-m2304.json',
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
  release.purchaseAuthority,
  false
);

console.log(
  'CIWU_OMEGA120_M2185_M2304_TEST_PASS'
);
