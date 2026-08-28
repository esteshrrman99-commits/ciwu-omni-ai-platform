'use strict';

function clamp01(value) {
  const n=Number(value);

  if (!Number.isFinite(n))
    return 0;

  return Math.max(
    0,
    Math.min(1,n)
  );
}

function score({
  quality,
  reliability,
  latencyEfficiency,
  costEfficiency,
  evidenceConfidence,
  failurePenalty = 0
}) {
  const q=clamp01(quality);
  const r=clamp01(reliability);
  const l=clamp01(latencyEfficiency);
  const c=clamp01(costEfficiency);
  const e=clamp01(evidenceConfidence);
  const p=clamp01(failurePenalty);

  const raw =
    (
      q * 0.30 +
      r * 0.25 +
      l * 0.15 +
      c * 0.15 +
      e * 0.15
    );

  const adjusted =
    clamp01(
      raw * (1 - p)
    );

  return {
    raw,
    failurePenalty:p,
    adjusted
  };
}

function rank(candidates) {
  return [...candidates]
    .map(item => ({
      ...item,
      calibration:
        score(item.metrics || {})
    }))
    .sort(
      (a,b) =>
        b.calibration.adjusted -
        a.calibration.adjusted
    );
}

module.exports = {
  clamp01,
  score,
  rank
};
