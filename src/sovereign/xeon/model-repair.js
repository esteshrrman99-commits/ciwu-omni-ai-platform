'use strict';

const {
  repairLoop
} = require(
  './repair-loop'
);

const {
  parse
} = require(
  './model-patch'
);

const {
  replace
} = require(
  './patch-engine'
);

async function run({
  workspace,
  askModel,
  runTests,
  diagnostic,
  maxAttempts = 3
}) {
  return repairLoop({
    maxAttempts,

    propose:
      async ({
        attempt,
        previous
      }) => {
        const text =
          await askModel({
            attempt,
            diagnostic,
            previous
          });

        return parse(
          text
        );
      },

    apply:
      async proposal => {
        const changed = [];

        for (
          const operation of
          proposal.operations
        ) {
          changed.push(
            replace({
              workspace,
              file:
                operation.file,
              before:
                operation.before,
              after:
                operation.after
            })
          );
        }

        return {
          changed
        };
      },

    test:
      async () =>
        runTests({
          workspace
        })
  });
}

module.exports = {
  run
};
