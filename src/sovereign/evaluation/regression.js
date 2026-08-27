'use strict';

function compare(previous, current, tolerance = 0.02) {
  if (
    !Number.isFinite(previous) ||
    !Number.isFinite(current)
  ) throw new TypeError('SCORE_REQUIRED');

  const delta = current - previous;

  return {
    previous,
    current,
    delta,
    regressed: delta < -Math.abs(tolerance)
  };
}

module.exports = {
  compare
};
