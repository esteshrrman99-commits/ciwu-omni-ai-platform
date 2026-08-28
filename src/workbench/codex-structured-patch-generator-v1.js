'use strict';

const crypto=require('node:crypto');

const policy=
  require('./xeon-sandbox-policy-v1');

function idFor(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex')
    .slice(0,20);
}

function generate({
  objective='',
  operations=[]
}={}) {
  const goal=
    String(objective).trim();

  if (
    !goal ||
    goal.length > 2000
  ) {
    throw new Error(
      'CODEX_PATCH_OBJECTIVE_INVALID'
    );
  }

  if (
    !Array.isArray(operations) ||
    operations.length === 0 ||
    operations.length >
      policy.MAX_PATCH_OPERATIONS
  ) {
    throw new Error(
      'CODEX_PATCH_OPERATION_COUNT_INVALID'
    );
  }

  const safeOperations=
    operations.map(
      policy.assertPatchOperation
    );

  const candidate={
    schema:
      'CIWU_CODEX_STRUCTURED_PATCH_V1',
    objective:goal,
    operations:safeOperations,
    productionTarget:false,
    sandboxOnly:true,
    generatedByProvider:false,
    providerCallRequired:false,
    gitMutation:false
  };

  return {
    ok:true,
    readOnly:true,
    candidatePatchGenerated:true,
    patchId:idFor(candidate),
    candidate
  };
}

module.exports={
  idFor,
  generate
};
