'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const {
  assertLoopbackOrigin
} = require(
  '../../src/native-workspace/http-origin-guard-v1'
);

function req(origin, site) {
  return {
    headers:{
      origin,
      'sec-fetch-site':
        site || 'same-origin'
    }
  };
}

test(
  'default origin policy remains loopback-only',
  () => {
    const prior =
      process.env.CIWU_PUBLIC_HOST;

    delete process.env.CIWU_PUBLIC_HOST;

    assert.equal(
      assertLoopbackOrigin(
        req(
          'http://127.0.0.1:1234'
        )
      ),
      true
    );

    assert.throws(
      () =>
        assertLoopbackOrigin(
          req(
            'https://example.com'
          )
        ),
      /FOREIGN_ORIGIN_BLOCKED/
    );

    if (prior !== undefined) {
      process.env.CIWU_PUBLIC_HOST =
        prior;
    }
  }
);

test(
  'explicit Render same-origin is allowed while foreign origin is blocked',
  () => {
    const prior =
      process.env.CIWU_PUBLIC_HOST;

    process.env.CIWU_PUBLIC_HOST =
      'ciwu-omni-ai-platform.onrender.com';

    assert.equal(
      assertLoopbackOrigin(
        req(
          'https://ciwu-omni-ai-platform.onrender.com'
        )
      ),
      true
    );

    assert.throws(
      () =>
        assertLoopbackOrigin(
          req(
            'https://attacker.example'
          )
        ),
      /FOREIGN_ORIGIN_BLOCKED/
    );

    if (prior === undefined) {
      delete process.env.CIWU_PUBLIC_HOST;
    } else {
      process.env.CIWU_PUBLIC_HOST =
        prior;
    }
  }
);

test(
  'production bridge and canonical logo are present',
  () => {
    assert.equal(
      fs.existsSync(
        'src/native-workspace/production-server-v1.js'
      ),
      true
    );

    assert.equal(
      fs.existsSync(
        'public/brand/ciwu-omega-infinity-logo.png'
      ),
      true
    );

    assert.ok(
      fs.statSync(
        'public/brand/ciwu-omega-infinity-logo.png'
      ).size > 1000
    );
  }
);
