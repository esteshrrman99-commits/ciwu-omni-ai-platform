'use strict';

const crypto=require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function synthesize({
  decomposition,
  context,
  maxCandidateFiles=8,
  maxIterations=6
}={}) {
  if (
    !decomposition ||
    decomposition.schema!=='CIWU_CORTEX_TASK_DECOMPOSITION_V1'
  ) {
    throw new Error('PLAN_DECOMPOSITION_REQUIRED');
  }

  if (
    !context ||
    context.schema!=='CIWU_CORTEX_CONTEXT_COMPILER_V1'
  ) {
    throw new Error('PLAN_CONTEXT_REQUIRED');
  }

  if (
    !Number.isInteger(maxCandidateFiles) ||
    maxCandidateFiles<1 ||
    maxCandidateFiles>16
  ) {
    throw new Error('PLAN_FILE_LIMIT_INVALID');
  }

  if (
    !Number.isInteger(maxIterations) ||
    maxIterations<1 ||
    maxIterations>8
  ) {
    throw new Error('PLAN_ITERATION_LIMIT_INVALID');
  }

  const plan={
    schema:'CIWU_CORTEX_ENGINEERING_PLAN_V1',
    objective:decomposition.objective,
    taskCount:decomposition.tasks.length,
    tasks:decomposition.tasks,
    contextHash:context.contextHash,
    contextSections:context.admittedCount,
    maxCandidateFiles,
    maxIterations,
    requiredGates:[
      'DIMENSIONAL_VALIDITY',
      'PROVENANCE_VALIDITY',
      'VALIDATION_PASS',
      'NO_CRITICAL_REGRESSION',
      'AUTHORIZATION_SEPARATION'
    ],
    productionMutation:false,
    autonomousGitCommit:false,
    autonomousGitPush:false,
    autonomousDeploy:false
  };

  return Object.freeze({
    ...plan,
    planHash:hash(plan)
  });
}

module.exports={
  synthesize
};
