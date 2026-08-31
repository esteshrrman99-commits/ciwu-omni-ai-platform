'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const MODULE =
  '../../src/native-workspace/http-origin-guard-v1';

function load(publicHost) {
  const resolved = require.resolve(MODULE);
  delete require.cache[resolved];

  if (publicHost === null) {
    delete process.env.CIWU_PUBLIC_HOST;
  } else {
    process.env.CIWU_PUBLIC_HOST = publicHost;
  }

  return require(MODULE);
}

function req({
  method='GET',
  host='ciwu-omni-ai-platform.onrender.com',
  site='cross-site',
  mode='navigate',
  dest='document',
  origin
} = {}) {
  const headers = {
    host,
    'sec-fetch-site':site,
    'sec-fetch-mode':mode,
    'sec-fetch-dest':dest
  };

  if (origin !== undefined) {
    headers.origin = origin;
  }

  return {
    method,
    headers
  };
}

function expectBlocked(fn, pattern) {
  assert.throws(
    fn,
    pattern
  );
}

test(
  'R2 exact public GET document navigation allowed',
  () => {
    const {
      assertLoopbackOrigin
    } = load(
      'ciwu-omni-ai-platform.onrender.com'
    );

    assert.doesNotThrow(() =>
      assertLoopbackOrigin(req())
    );
  }
);

test(
  'R2 exact public HEAD document navigation allowed',
  () => {
    const {
      assertLoopbackOrigin
    } = load(
      'ciwu-omni-ai-platform.onrender.com'
    );

    assert.doesNotThrow(() =>
      assertLoopbackOrigin(
        req({method:'HEAD'})
      )
    );
  }
);

test(
  'R2 cross-site POST remains blocked',
  () => {
    const {
      assertLoopbackOrigin
    } = load(
      'ciwu-omni-ai-platform.onrender.com'
    );

    expectBlocked(
      () =>
        assertLoopbackOrigin(
          req({method:'POST'})
        ),
      /CROSS_SITE_REQUEST_BLOCKED/
    );
  }
);

test(
  'R2 cross-site API fetch remains blocked',
  () => {
    const {
      assertLoopbackOrigin
    } = load(
      'ciwu-omni-ai-platform.onrender.com'
    );

    expectBlocked(
      () =>
        assertLoopbackOrigin(
          req({
            mode:'cors',
            dest:'empty'
          })
        ),
      /CROSS_SITE_REQUEST_BLOCKED/
    );
  }
);

test(
  'R2 foreign host navigation remains blocked',
  () => {
    const {
      assertLoopbackOrigin
    } = load(
      'ciwu-omni-ai-platform.onrender.com'
    );

    expectBlocked(
      () =>
        assertLoopbackOrigin(
          req({
            host:'evil.example'
          })
        ),
      /CROSS_SITE_REQUEST_BLOCKED/
    );
  }
);

test(
  'R2 public navigation requires explicit CIWU public host',
  () => {
    const {
      assertLoopbackOrigin
    } = load(null);

    expectBlocked(
      () =>
        assertLoopbackOrigin(req()),
      /CROSS_SITE_REQUEST_BLOCKED/
    );
  }
);

test.after(() => {
  delete process.env.CIWU_PUBLIC_HOST;
  const resolved = require.resolve(MODULE);
  delete require.cache[resolved];
});
