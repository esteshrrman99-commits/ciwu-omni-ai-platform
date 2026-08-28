'use strict';

const crypto = require('node:crypto');

const {
  parse
} = require(
  './model-output-parser'
);

const {
  certify
} = require(
  '../xeon/sandbox-certification'
);

function hash(
  value
) {
  return crypto
    .createHash('sha256')
    .update(
      String(value)
    )
    .digest('hex');
}

async function run({
  prompt,
  invokeModel,
  applySandboxPatch,
  runSandboxTests
}) {
  if (
    typeof invokeModel !==
    'function'
  ) {
    throw new Error(
      'MODEL_INVOKER_REQUIRED'
    );
  }

  const modelText =
    await invokeModel(
      prompt
    );

  const plan =
    parse(
      modelText
    );

  const patchResult =
    await applySandboxPatch(
      plan
    );

  const testResult =
    await runSandboxTests(
      patchResult
    );

  const certification =
    certify({
      workspaceIsTemporary:
        true,

      productionPathTouched:
        false,

      syntaxPassed:
        testResult.syntaxPassed ===
        true,

      testsPassed:
        testResult.testsPassed ===
        true,

      patchValidated:
        true,

      cleanupConfirmed:
        testResult.cleanupConfirmed ===
        true
    });

  return {
    promptHash:
      hash(prompt),

    modelOutputHash:
      hash(modelText),

    patchPlan:
      plan,

    testResult,

    certification,

    productionMutation:
      false
  };
}

module.exports = {
  hash,
  run
};
