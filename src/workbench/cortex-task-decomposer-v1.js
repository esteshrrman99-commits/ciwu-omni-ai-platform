'use strict';

const MAX_OBJECTIVE_CHARS=4000;
const MAX_TASKS=12;

function normalizeObjective(value) {
  const objective=String(value || '').trim();

  if (!objective || objective.length>MAX_OBJECTIVE_CHARS) {
    throw new Error('CORTEX_OBJECTIVE_INVALID');
  }

  return objective;
}

function decompose({
  objective,
  evidenceAvailable=false,
  repositoryTask=true
}={}) {
  const goal=normalizeObjective(objective);

  const tasks=[
    {
      id:'T1',
      phase:'UNDERSTAND',
      objective:'Interpret requested outcome and constraints.',
      dependsOn:[]
    },
    {
      id:'T2',
      phase:'GROUND',
      objective:'Collect bounded relevant project evidence.',
      dependsOn:['T1']
    },
    {
      id:'T3',
      phase:'PLAN',
      objective:'Construct minimal reversible engineering plan.',
      dependsOn:['T2']
    },
    {
      id:'T4',
      phase:'GENERATE',
      objective:'Generate bounded candidate implementation.',
      dependsOn:['T3']
    },
    {
      id:'T5',
      phase:'VALIDATE',
      objective:'Run syntax and selected regression validation.',
      dependsOn:['T4']
    },
    {
      id:'T6',
      phase:'CRITIQUE',
      objective:'Identify unsupported assumptions and regressions.',
      dependsOn:['T5']
    },
    {
      id:'T7',
      phase:'REPAIR',
      objective:'Repair only evidence-supported defects.',
      dependsOn:['T6']
    },
    {
      id:'T8',
      phase:'REVERIFY',
      objective:'Re-run validation after repair.',
      dependsOn:['T7']
    },
    {
      id:'T9',
      phase:'JUDGE',
      objective:'Decide whether candidate is verified or abstain.',
      dependsOn:['T8']
    },
    {
      id:'T10',
      phase:'HANDOFF',
      objective:'Produce evidence-bound human review artifact.',
      dependsOn:['T9']
    }
  ];

  if (tasks.length>MAX_TASKS) {
    throw new Error('CORTEX_TASK_LIMIT_EXCEEDED');
  }

  return Object.freeze({
    schema:'CIWU_CORTEX_TASK_DECOMPOSITION_V1',
    objective:goal,
    repositoryTask:Boolean(repositoryTask),
    evidenceAvailable:Boolean(evidenceAvailable),
    tasks,
    productionMutation:false,
    autonomousGit:false,
    autonomousDeploy:false
  });
}

module.exports={
  MAX_OBJECTIVE_CHARS,
  MAX_TASKS,
  normalizeObjective,
  decompose
};
