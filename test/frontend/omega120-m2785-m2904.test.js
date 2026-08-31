'use strict';

const assert=
  require('node:assert/strict');

const fs=
  require('node:fs');

const rebaser=
  require('../../src/workbench/original-product-asset-rebaser-v1');

const compiler=
  require('../../src/workbench/original-product-fusion-compiler-v1');

const integrity=
  require('../../src/workbench/dual-surface-integrity-v1');

assert.equal(
  rebaser.rebaseValue(
    '/styles.css'
  ),
  '/original-platform-v1/styles.css'
);

assert.equal(
  rebaser.rebaseValue(
    '/api/m3/health'
  ),
  '/api/m3/health'
);

const compiled=
  compiler.inject(
    '<html><head></head><body><h1>Original</h1></body></html>'
  );

assert.ok(
  compiled.html.includes(
    'ciwu-sovereign-intelligence-bridge.js'
  )
);

assert.ok(
  compiled.html.includes(
    'ciwu-product-ai-assistant.js'
  )
);

const product=
  fs.readFileSync(
    'public/index.html',
    'utf8'
  );

const sovereign=
  fs.readFileSync(
    'public/sovereign/index.html',
    'utf8'
  );

assert.ok(
  product.includes(
    'ciwu-fusion-generation'
  )
);

assert.ok(
  product.includes(
    'ciwu-product-ai-assistant.js'
  )
);

assert.ok(
  /Command Center|Sovereign Intelligence Fabric|M3 Intelligence/i
    .test(sovereign)
);

const dual=
  integrity.create({
    originalCandidate:
      'bbab3c80968b1eea7a3b5166a28712cb0f9738db',
    certifiedParent:
      process.env.CIWU_TEST_BASE_SHA ||
      '1111111111111111111111111111111111111111'
  });

assert.equal(
  dual.productPrimary,
  true
);

assert.equal(
  dual.sovereignAdminPreserved,
  true
);

const release=
  JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m2785-m2904.json',
      'utf8'
    )
  );

assert.equal(
  release.milestoneCount,
  120
);

assert.equal(
  release.originalProductPrimary,
  true
);

assert.equal(
  release.sovereignCommandCenterPreserved,
  true
);

assert.equal(
  release.automaticProviderCalls,
  false
);

assert.equal(
  release.productionMutationAuthority,
  false
);

assert.equal(
  release.autonomousGitPush,
  false
);

console.log(
  'CIWU_OMEGA120_M2785_M2904_TEST_PASS'
);
