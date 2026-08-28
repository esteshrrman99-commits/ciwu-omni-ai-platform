'use strict';

function clamp(value) {
  const n=Number(value);

  if (!Number.isFinite(n))
    return 0;

  return Math.max(
    0,
    Math.min(1,n)
  );
}

function evaluate({
  quality,
  reliability,
  latencyEfficiency,
  costEfficiency,
  evidenceConfidence,
  healthConfidence,
  failurePenalty,
  authorizationValid,
  safetyValid,
  evidenceFresh
}) {
  const gate=
    authorizationValid === true &&
    safetyValid === true &&
    evidenceFresh === true;

  if (!gate) {
    return {
      admitted:false,
      score:0,
      reason:'HARD_GATE_FAILED'
    };
  }

  const base=
    clamp(quality)*0.25 +
    clamp(reliability)*0.20 +
    clamp(latencyEfficiency)*0.10 +
    clamp(costEfficiency)*0.15 +
    clamp(evidenceConfidence)*0.15 +
    clamp(healthConfidence)*0.15;

  const score=
    clamp(
      base *
      (1-clamp(failurePenalty))
    );

  return {
    admitted:true,
    score,
    reason:'HARD_GATES_PASS'
  };
}

module.exports={
  clamp,
  evaluate
};
