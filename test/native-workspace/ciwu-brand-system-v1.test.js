'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const path =
  require('node:path');

const {
  BRAND,
  brandStyles,
  topbar,
  hero,
  capabilityGrid,
  brandShell
} = require(
  '../../src/native-workspace/ciwu-brand-system-v1'
);

test(
  'CIWU brand identity is constitutionally named',
  () => {
    assert.equal(
      BRAND.name,
      'CIWU Ω∞'
    );

    assert.match(
      BRAND.constitution,
      /TERMINUS/
    );

    assert.match(
      BRAND.principle,
      /FINITE AUTHORITY/
    );
  }
);

test(
  'CIWU brand system contains cinematic design primitives',
  () => {
    const css =
      brandStyles();

    assert.match(
      css,
      /--ciwu-gold/
    );

    assert.match(
      css,
      /--ciwu-blue/
    );

    assert.match(
      css,
      /ciwuOrbit/
    );

    assert.match(
      css,
      /prefers-reduced-motion/
    );
  }
);

test(
  'CIWU hero exposes canonical logo and launch action',
  () => {
    const rendered =
      hero();

    assert.match(
      rendered,
      /ciwu-omega-infinity-logo\.png/
    );

    assert.match(
      rendered,
      /OPEN CIWU/
    );

    assert.match(
      rendered,
      /ENTER THE/
    );
  }
);

test(
  'CIWU navigation and capability architecture render',
  () => {
    const rendered =
      topbar() +
      capabilityGrid();

    assert.match(
      rendered,
      /ACCESS CONSOLE/
    );

    assert.match(
      rendered,
      /ZORTEX Ω²/
    );

    assert.match(
      rendered,
      /NERUTEX Ω²/
    );

    assert.match(
      rendered,
      /EONS Ω∞/
    );
  }
);

test(
  'CIWU master brand shell composes',
  () => {
    const rendered =
      brandShell();

    assert.match(
      rendered,
      /ciwu-shell/
    );

    assert.match(
      rendered,
      /ciwu-master-logo/
    );
  }
);

test(
  'canonical CIWU logo asset exists',
  () => {
    const asset =
      path.join(
        process.cwd(),
        'public',
        'brand',
        'ciwu-omega-infinity-logo.png'
      );

    assert.equal(
      fs.existsSync(asset),
      true
    );

    assert.equal(
      fs.statSync(asset).size > 1000,
      true
    );
  }
);
