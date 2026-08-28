'use strict';

const grounding=
  require('./grounded-context-selector-v1');

const citations=
  require('./source-citation-envelope-v1');

const regression=
  require('./regression-plan-generator-v1');

function plan({
  root=process.cwd(),
  objective='',
  files=[],
  symbols=[]
}={}) {
  const goal=
    String(objective).trim();

  if (!goal)
    throw new Error(
      'PATCH_OBJECTIVE_REQUIRED'
    );

  if (goal.length > 2000)
    throw new Error(
      'PATCH_OBJECTIVE_TOO_LONG'
    );

  const grounded=
    grounding.select({
      root,
      files,
      symbols
    });

  return {
    ok:true,
    readOnly:true,
    planningOnly:true,
    objective:goal,
    grounded,
    citations:
      citations.build(
        grounded
      ),
    regressionPlan:
      regression.generate({
        root,
        files:
          grounded.files
      }),
    candidatePatchGenerated:false,
    candidatePatchApplied:false,
    productionMutation:false,
    shellExecution:false,
    gitCommit:false,
    gitPush:false,
    purchaseAuthority:false,
    requiresSeparateAuthorization:true
  };
}

module.exports={plan};
