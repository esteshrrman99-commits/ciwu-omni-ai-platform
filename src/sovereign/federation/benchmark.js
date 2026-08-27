'use strict';

function finite01(value) {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function evaluate(result) {
  const fields = [
    'correctness',
    'testPassRate',
    'reasoningQuality',
    'codingQuality',
    'reliability'
  ];

  for (const field of fields) {
    if (!finite01(result[field]))
      throw new RangeError(
        `INVALID_${field.toUpperCase()}`
      );
  }

  const quality =
    0.30 * result.correctness +
    0.25 * result.testPassRate +
    0.15 * result.reasoningQuality +
    0.20 * result.codingQuality +
    0.10 * result.reliability;

  return {
    provider: result.provider,
    model: result.model,
    quality,
    passed:
      quality >=
      (result.threshold ?? 0.75)
  };
}

function rank(results) {
  return results
    .map(evaluate)
    .sort(
      (a, b) =>
        b.quality - a.quality
    );
}

module.exports = {
  evaluate,
  rank
};
