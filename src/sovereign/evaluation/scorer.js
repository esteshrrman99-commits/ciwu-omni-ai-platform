'use strict';

function unit(value, name) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) throw new RangeError(`INVALID_${name}`);

  return value;
}

function score(r) {
  const correctness =
    unit(r.correctness, 'CORRECTNESS');

  const tests =
    unit(r.testPassRate, 'TEST_PASS_RATE');

  const reasoning =
    unit(r.reasoning, 'REASONING');

  const coding =
    unit(r.coding, 'CODING');

  const reliability =
    unit(r.reliability, 'RELIABILITY');

  const safety =
    unit(r.safety, 'SAFETY');

  return (
    correctness * 0.25 +
    tests * 0.25 +
    reasoning * 0.15 +
    coding * 0.15 +
    reliability * 0.10 +
    safety * 0.10
  );
}

function passThreshold(r, threshold = 0.75) {
  return score(r) >= threshold;
}

module.exports = {
  score,
  passThreshold
};
