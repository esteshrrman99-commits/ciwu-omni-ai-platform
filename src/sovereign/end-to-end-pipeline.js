'use strict';

const {
  choose
} = require(
  './provider-runtime/router-v3'
);

const {
  run
} = require(
  './codex/certified-trial'
);

const {
  create
} = require(
  './observability/decision-trace'
);

async function execute({
  providers,
  routingOptions,
  prompt,
  invokeModel,
  applySandboxPatch,
  runSandboxTests
}) {
  const routing =
    choose(
      providers,
      routingOptions
    );

  if (!routing.selected) {
    return {
      ok: false,
      decision:
        'ABSTAIN',

      trace:
        create({
          action:
            'SOVEREIGN_REPAIR',

          inputs: {
            providerCount:
              providers.length
          },

          gates: {
            providerSelected:
              false
          },

          decision:
            'ABSTAIN'
        })
    };
  }

  const trial =
    await run({
      prompt,
      invokeModel,
      applySandboxPatch,
      runSandboxTests
    });

  const decision =
    trial.certification
      .certified === true
      ? 'CERTIFIED_PROPOSAL'
      : 'REJECT';

  return {
    ok:
      trial.certification
        .certified === true,

    routing,
    trial,
    decision,

    trace:
      create({
        action:
          'SOVEREIGN_REPAIR',

        inputs: {
          selectedProvider:
            routing.selected
        },

        gates: {
          sandboxCertified:
            trial.certification
              .certified ===
            true,

          productionMutation:
            false
        },

        decision
      })
  };
}

module.exports = {
  execute
};
