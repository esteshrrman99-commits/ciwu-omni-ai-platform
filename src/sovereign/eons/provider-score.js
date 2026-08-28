'use strict';

function clamp01(x) {
  return Math.max(
    0,
    Math.min(
      1,
      Number(x)
    )
  );
}

function score({
  quality,
  reliability,
  latency,
  cost,
  evidence,
  certified
}) {
  if (certified !== true)
    return 0;

  const q =
    clamp01(quality);

  const r =
    clamp01(reliability);

  const l =
    clamp01(latency);

  const c =
    clamp01(cost);

  const e =
    clamp01(evidence);

  return (
    q *
    r *
    e *
    (1 - l) *
    (1 - c)
  );
}

function rank(candidates) {
  return [...candidates]
    .map(
      x => ({
        ...x,
        eonsScore:
          score(x)
      })
    )
    .sort(
      (a,b) =>
        b.eonsScore -
        a.eonsScore
    );
}

module.exports = {
  clamp01,
  score,
  rank
};
