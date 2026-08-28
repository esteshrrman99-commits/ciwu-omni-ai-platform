'use strict';

const {
  build
} = require(
  './repair-plan'
);

const {
  run
} = require(
  '../xeon/model-repair'
);

async function execute({
  task,
  evidence,
  diagnostics,
  workspace,
  askModel,
  runTests,
  maxAttempts = 3
}) {
  const plan =
    build({
      task,
      evidence,
      diagnostics
    });

  const result =
    await run({
      workspace,

      maxAttempts,

      diagnostic:
        JSON.stringify(
          plan
        ),

      askModel,

      runTests
    });

  return {
    plan,
    result,

    productionMutation:
      false
  };
}

module.exports = {
  execute
};
