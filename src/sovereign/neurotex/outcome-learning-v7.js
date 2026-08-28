'use strict';

function clamp01(value) {
  const n =
    Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      n
    )
  );
}

function update({
  priorScore,
  observedSuccess,
  evidenceConfidence,
  learningRate = 0.1
}) {
  const prior =
    clamp01(priorScore);

  const observed =
    observedSuccess === true
      ? 1
      : 0;

  const confidence =
    clamp01(
      evidenceConfidence
    );

  const rate =
    clamp01(
      learningRate
    );

  const effectiveRate =
    rate *
    confidence;

  const posterior =
    clamp01(
      prior +
      effectiveRate *
      (
        observed -
        prior
      )
    );

  return {
    prior,
    observed,
    evidenceConfidence:
      confidence,

    effectiveLearningRate:
      effectiveRate,

    posterior,

    promoted:
      posterior >= 0.65,

    quarantined:
      posterior >= 0.25 &&
      posterior < 0.65,

    rejected:
      posterior < 0.25
  };
}

module.exports = {
  clamp01,
  update
};
