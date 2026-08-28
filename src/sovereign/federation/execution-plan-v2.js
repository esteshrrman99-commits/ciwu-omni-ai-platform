'use strict';

function build({
  rankedProviders,
  maximumAttempts = 3
}) {
  const limit =
    Number(maximumAttempts);

  if (
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    throw new Error(
      'INVALID_MAXIMUM_ATTEMPTS'
    );
  }

  const eligible =
    (rankedProviders || [])
      .filter(
        item => {
          const entry =
            item.entry || item;

          return (
            entry.runtimeEligible ===
            true
          );
        }
      )
      .slice(
        0,
        limit
      )
      .map(
        (item,index) => {
          const entry =
            item.entry || item;

          return {
            attempt:
              index + 1,

            provider:
              entry.provider,

            model:
              entry.model,

            expectedEonsScore:
              item.evaluation
                ? item.evaluation.score
                : null
          };
        }
      );

  if (!eligible.length) {
    return {
      executable: false,
      reason:
        'NO_CERTIFIED_RUNTIME_PROVIDER',
      attempts:[]
    };
  }

  return {
    executable: true,
    reason:
      'CERTIFIED_EXECUTION_PLAN_READY',
    attempts:
      eligible
  };
}

module.exports = {
  build
};
