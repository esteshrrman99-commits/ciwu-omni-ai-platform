'use strict';

const assert = require('assert/strict');
const fs = require('fs');

const ui =
  fs.readFileSync(
    'src/native-workspace/ui-shell-v1.js',
    'utf8'
  );

const runtime =
  fs.readFileSync(
    'src/native-workspace/runtime-factory-v1.js',
    'utf8'
  );

const capabilityRegistry =
  fs.readFileSync(
    'src/native-workspace/provider-capability-registry-v1.js',
    'utf8'
  );

const localAdapter =
  fs.readFileSync(
    'src/native-workspace/local-dry-run-provider-adapter-v1.js',
    'utf8'
  );

/*
 * Extract only the provider input tag from production UI.
 */
const match =
  ui.match(
    /<input\b[^>]*\bid=["']provider["'][^>]*>/is
  );

assert.ok(
  match,
  'PRODUCTION_PROVIDER_INPUT_REQUIRED'
);

const providerTag =
  match[0];

assert.match(
  providerTag,
  /\bvalue=["']CIWU_DRY_RUN["']/i
);

assert.doesNotMatch(
  providerTag,
  /\bvalue=["']MOCK["']/i
);

console.log(
  'T01_PRODUCTION_CHAT_DEFAULT_PROVIDER=PASS'
);

/*
 * Make sure the selected UI identity exists in the actual
 * local provider architecture.
 */
assert.match(
  capabilityRegistry,
  /CIWU_DRY_RUN/
);

assert.match(
  localAdapter,
  /CIWU_DRY_RUN/
);

assert.match(
  runtime,
  /providerRegistry/
);

console.log(
  'T02_PROVIDER_IDENTITY_CONTRACT=PASS'
);

/*
 * UI sendChat must continue taking the value from the provider
 * control instead of silently hardcoding another identity.
 */
assert.match(
  ui,
  /provider:\s*provider\.value/
);

console.log(
  'T03_CHAT_REQUEST_PROVIDER_BINDING=PASS'
);

/*
 * This repair must not enable external-provider authority.
 */
assert.doesNotMatch(
  providerTag,
  /OPENAI|OPENROUTER|ANTHROPIC|GEMINI|GROQ/i
);

console.log(
  'T04_EXTERNAL_PROVIDER_NOT_ENABLED=PASS'
);

console.log(
  'LEAP024_A1_PROVIDER_BINDING_TEST=PASS'
);
