'use strict';

const assert=
  require('node:assert/strict');

const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');

const proposalLib=
  require('../../src/workbench/repair-proposal-v1');

const diffLib=
  require('../../src/workbench/proposal-diff-envelope-v1');

const tokenLib=
  require('../../src/workbench/approval-token-v1');

const verifier=
  require('../../src/workbench/approval-binding-verifier-v1');

const controlled=
  require('../../src/workbench/controlled-review-apply-v1');

const reverify=
  require('../../src/workbench/post-apply-reverification-v1');

const base=
  process.env.CIWU_TEST_BASE_SHA ||
  '1111111111111111111111111111111111111111';

const evidenceHash=
  crypto
    .createHash('sha256')
    .update('test-evidence')
    .digest('hex');

const file=
  'test/frontend/xeon-sandbox-fixture.js';

const original=
  fs.readFileSync(
    file,
    'utf8'
  );

const proposal=
  proposalLib.create({
    baseSha:base,
    objective:
      'Verify deterministic approval-gated review application.',
    evidenceHash,
    operations:[
      {
        type:'replace_exact',
        file,
        before:
          'return 40 + 2;',
        after:
          'return 42;'
      }
    ]
  });

assert.equal(
  proposal.productionApplyAuthorized,
  false
);

assert.match(
  proposal.proposalId,
  /^[0-9a-f]{64}$/
);

const diff=
  diffLib.build(
    proposal
  );

assert.equal(
  diff.reviewRequired,
  true
);

assert.equal(
  diff.mutationPerformed,
  false
);

assert.match(
  diff.diffSha256,
  /^[0-9a-f]{64}$/
);

const secret=
  Buffer.alloc(
    32,
    0x42
  );

const now=1700000100;

const issued=
  tokenLib.issue({
    proposal,
    secret,
    now,
    ttlSeconds:60,
    jti:
      'test-jti-0000000000001'
  });

const approval=
  verifier.verify({
    token:
      issued.token,
    secret,
    proposal,
    currentBaseSha:base,
    now:now + 1
  });

assert.equal(
  approval.verified,
  true
);

assert.equal(
  approval.productionApplyAuthority,
  false
);

assert.equal(
  approval.gitPushAuthority,
  false
);

assert.throws(
  () =>
    tokenLib.decodeAndVerify({
      token:
        issued.token,
      secret,
      now:now + 61
    }),
  /TOKEN_EXPIRED/
);

assert.throws(
  () =>
    verifier.verify({
      token:
        issued.token,
      secret,
      proposal,
      currentBaseSha:
        '0000000000000000000000000000000000000000',
      now:now + 1
    }),
  /APPROVAL_CURRENT_BASE_MISMATCH/
);

const workspace=
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-review-'
    )
  );

try {
  const destination=
    path.join(
      workspace,
      file
    );

  fs.mkdirSync(
    path.dirname(
      destination
    ),
    {
      recursive:true
    }
  );

  fs.copyFileSync(
    file,
    destination
  );

  const applied=
    controlled.apply({
      workspace,
      proposal,
      approval
    });

  assert.equal(
    applied.controlledApply,
    true
  );

  assert.equal(
    applied.reviewWorkspaceOnly,
    true
  );

  assert.equal(
    applied.productionApply,
    false
  );

  const verified=
    reverify.reverify({
      workspace,
      tests:[file]
    });

  assert.equal(
    verified.ok,
    true
  );

  assert.equal(
    verified.productionExecution,
    false
  );

} finally {
  fs.rmSync(
    workspace,
    {
      recursive:true,
      force:true
    }
  );
}

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
      'data/sovereign/omega120-m2425-m2544.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.humanApprovalRequired,
  true
);

assert.equal(
  release.productionApply,
  false
);

assert.equal(
  release.liveApprovalTokenIssuance,
  false
);

assert.equal(
  release.gitPushAuthority,
  false
);

console.log(
  'CIWU_OMEGA120_M2425_M2544_TEST_PASS'
);
