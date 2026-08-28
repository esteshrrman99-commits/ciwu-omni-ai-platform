'use strict';

function reliability(
  outcomes
) {
  if (!outcomes.length)
    return 0;

  return (
    outcomes.filter(Boolean)
      .length /
    outcomes.length
  );
}

function latencyScore(
  latencyMs,
  {
    targetMs = 1000,
    maxMs = 10000
  } = {}
) {
  if (
    latencyMs <=
    targetMs
  ) return 1;

  if (
    latencyMs >=
    maxMs
  ) return 0;

  return (
    1 -
    (
      latencyMs -
      targetMs
    ) /
    (
      maxMs -
      targetMs
    )
  );
}

function qualityScore({
  accuracy,
  reliabilityScore,
  latencyScoreValue
}) {
  return (
    Number(accuracy) *
    Number(reliabilityScore) *
    Number(latencyScoreValue)
  );
}

module.exports = {
  reliability,
  latencyScore,
  qualityScore
};
