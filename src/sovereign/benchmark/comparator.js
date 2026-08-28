'use strict';

function score({
  accuracy,
  reliability,
  latencyScore,
  costScore,
  evidenceConfidence
}) {
  const values = [
    accuracy,
    reliability,
    latencyScore,
    costScore,
    evidenceConfidence
  ].map(Number);

  if (
    values.some(
      x =>
        !Number.isFinite(x)
    )
  ) {
    return 0;
  }

  return (
    values[0] *
    values[1] *
    values[2] *
    values[3] *
    values[4]
  );
}

function rank(
  rows
) {
  return [...rows]
    .map(
      row => ({
        ...row,
        benchmarkScore:
          score(row)
      })
    )
    .sort(
      (a,b) =>
        b.benchmarkScore -
        a.benchmarkScore
    );
}

module.exports = {
  score,
  rank
};
