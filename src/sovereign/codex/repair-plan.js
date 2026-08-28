'use strict';

function build({
  task,
  evidence,
  diagnostics
}) {
  if (!task)
    throw new Error(
      'TASK_REQUIRED'
    );

  return {
    schema:
      'CIWU_REPAIR_PLAN_V1',

    task,

    evidence:
      Array.isArray(evidence)
        ? evidence
        : [],

    diagnostics:
      Array.isArray(diagnostics)
        ? diagnostics
        : [],

    outputContract: {
      format:
        'JSON_ONLY',

      operationType:
        'replace',

      maximumOperations:
        20,

      productionMutation:
        false
    }
  };
}

module.exports = {
  build
};
