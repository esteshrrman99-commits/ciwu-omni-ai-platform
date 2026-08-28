'use strict';

const METRICS=Object.freeze([
  'taskSuccess',
  'validationPassRate',
  'regressionAvoidance',
  'evidenceCompleteness',
  'repairEfficiency',
  'contextPrecision'
]);

function clamp(value) {
  const n=Number(value);

  if (!Number.isFinite(n)) {
    throw new Error('EVAL_METRIC_INVALID');
  }

  return Math.max(0,Math.min(1,n));
}

function normalize(metrics={}) {
  const out={};

  for (const key of METRICS) {
    out[key]=clamp(metrics[key] ?? 0);
  }

  return out;
}

function mean(metrics) {
  return METRICS.reduce(
    (sum,key)=>sum+metrics[key],
    0
  )/METRICS.length;
}

function compare({
  baseline,
  candidate,
  minimumGain=0.02
}={}) {
  const a=normalize(baseline);
  const b=normalize(candidate);

  const baselineScore=mean(a);
  const candidateScore=mean(b);
  const gain=candidateScore-baselineScore;

  const regressions=METRICS.filter(
    key=>b[key]<a[key]-0.05
  );

  const improved=
    gain>=minimumGain &&
    regressions.length===0;

  return Object.freeze({
    schema:'CIWU_CORTEX_ENGINEERING_EVALS_V1',
    metrics:METRICS,
    baseline:a,
    candidate:b,
    baselineScore,
    candidateScore,
    gain,
    regressions,
    improved,
    universalSuperiorityClaim:false,
    benchmarkScopeRequired:true
  });
}

module.exports={
  METRICS,
  clamp,
  normalize,
  mean,
  compare
};
