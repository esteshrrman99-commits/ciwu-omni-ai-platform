'use strict';

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

async function execute({
  providerEvidence,
  requestModel,
  prompt,
  applySandboxPatch,
  runSandboxTests
}) {
  if (
    providerEvidence
      ?.realInference !==
    true
  ) {
    throw new Error(
      'CERTIFIED_PROVIDER_EVIDENCE_REQUIRED'
    );
  }

  if (
    typeof requestModel !==
    'function'
  ) {
    throw new Error(
      'MODEL_REQUEST_FUNCTION_REQUIRED'
    );
  }

  const output =
    await requestModel(
      prompt
    );

  const plan =
    parse(
      output
    );

  const patch =
    await applySandboxPatch(
      plan
    );

  const tests =
    await runSandboxTests(
      patch
    );

  const certification =
    certify({
      workspaceIsTemporary:
        true,

      productionPathTouched:
        false,

      syntaxPassed:
        tests.syntaxPassed ===
        true,

      testsPassed:
        tests.testsPassed ===
        true,

      patchValidated:
        true,

      cleanupConfirmed:
        tests.cleanupConfirmed ===
        true
    });

  return {
    provider:
      providerEvidence.provider,

    model:
      providerEvidence.model,

    plan,
    tests,
    certification,

    productionMutation:
      false,

    gitMutation:
      false
  };
}

module.exports = {
  execute
};
