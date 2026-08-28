'use strict';

async function run({
  providerEntry,
  context,
  requestModel,
  parsePatch,
  executeSandbox,
  certifySandbox
}) {
  if (
    providerEntry?.runtimeEligible !==
    true
  ) {
    return {
      executed: false,
      reason:
        'CERTIFIED_PROVIDER_REQUIRED'
    };
  }

  if (
    typeof requestModel !==
    'function' ||
    typeof parsePatch !==
    'function' ||
    typeof executeSandbox !==
    'function' ||
    typeof certifySandbox !==
    'function'
  ) {
    throw new Error(
      'REPAIR_CEREMONY_DEPENDENCY_MISSING'
    );
  }

  const modelOutput =
    await requestModel({
      provider:
        providerEntry.provider,

      model:
        providerEntry.model,

      context
    });

  const patch =
    parsePatch(
      modelOutput
    );

  const sandboxResult =
    await executeSandbox(
      patch
    );

  const certification =
    certifySandbox(
      sandboxResult
    );

  return {
    executed: true,

    provider:
      providerEntry.provider,

    model:
      providerEntry.model,

    patch,

    sandboxResult,

    certification,

    productionMutation:
      false,

    gitMutation:
      false
  };
}

module.exports = {
  run
};
