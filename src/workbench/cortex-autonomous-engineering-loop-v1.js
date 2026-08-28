'use strict';

const decomposer=
  require('./cortex-task-decomposer-v1');

const compiler=
  require('./cortex-context-compiler-v1');

const planner=
  require('./cortex-plan-synthesizer-v1');

const criticLib=
  require('./cortex-critic-v1');

const judgeLib=
  require('./cortex-judge-v1');

const MAX_ITERATIONS=6;

async function run({
  objective,
  contextSections=[],
  generateCandidate,
  validateCandidate,
  repairCandidate,
  evidenceScore=1,
  maxIterations=MAX_ITERATIONS
}={}) {
  if (typeof generateCandidate!=='function') {
    throw new Error('ENGINEERING_GENERATOR_REQUIRED');
  }

  if (typeof validateCandidate!=='function') {
    throw new Error('ENGINEERING_VALIDATOR_REQUIRED');
  }

  if (
    !Number.isInteger(maxIterations) ||
    maxIterations<1 ||
    maxIterations>MAX_ITERATIONS
  ) {
    throw new Error('ENGINEERING_ITERATION_LIMIT_INVALID');
  }

  const decomposition=
    decomposer.decompose({
      objective,
      evidenceAvailable:
        contextSections.length>0
    });

  const context=
    compiler.compile({
      objective,
      sections:contextSections
    });

  const plan=
    planner.synthesize({
      decomposition,
      context,
      maxIterations
    });

  const history=[];

  let candidate=
    await generateCandidate({
      objective,
      context,
      plan,
      iteration:1
    });

  for (
    let iteration=1;
    iteration<=maxIterations;
    iteration++
  ) {
    const validation=
      await validateCandidate({
        candidate,
        context,
        plan,
        iteration
      });

    const critic=
      criticLib.critique({
        candidate,
        validation,
        context,
        plan
      });

    const gates={
      dimensionsValid:
        validation?.dimensionsValid===true,
      provenanceValid:
        validation?.provenanceValid===true,
      validationPassed:
        validation?.ok===true,
      noCriticalRegression:
        validation?.regression!==true,
      authorizationValid:true
    };

    const judge=
      judgeLib.judge({
        critic,
        gates,
        evidenceScore
      });

    history.push({
      iteration,
      validation,
      critic,
      judge
    });

    if (judge.verified===true) {
      return Object.freeze({
        schema:
          'CIWU_CORTEX_AUTONOMOUS_ENGINEERING_LOOP_V1',
        status:'VERIFIED',
        objective,
        plan,
        context,
        candidate,
        history,
        iterations:iteration,
        productionMutation:false,
        autonomousGit:false,
        autonomousDeployment:false
      });
    }

    if (
      iteration===maxIterations ||
      typeof repairCandidate!=='function'
    ) {
      break;
    }

    candidate=
      await repairCandidate({
        candidate,
        validation,
        critic,
        judge,
        context,
        plan,
        iteration
      });
  }

  return Object.freeze({
    schema:
      'CIWU_CORTEX_AUTONOMOUS_ENGINEERING_LOOP_V1',
    status:'ABSTAIN',
    objective,
    plan,
    context,
    candidate,
    history,
    iterations:history.length,
    productionMutation:false,
    autonomousGit:false,
    autonomousDeployment:false
  });
}

module.exports={
  MAX_ITERATIONS,
  run
};
