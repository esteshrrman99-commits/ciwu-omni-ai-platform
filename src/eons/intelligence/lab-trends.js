'use strict';

function analyzeTrend(points = []) {
  const clean = points
    .map(point => ({
      date: point.date,
      value: Number(point.value),
      unit: point.unit || null
    }))
    .filter(point =>
      Number.isFinite(point.value)
    )
    .sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

  if (clean.length < 2) {
    return {
      state: 'INSUFFICIENT_DATA',
      points: clean,
      direction: 'UNKNOWN'
    };
  }

  const first = clean[0].value;
  const last = clean[clean.length - 1].value;
  const delta = last - first;
  const tolerance =
    Math.max(Math.abs(first) * 0.03, 0.0001);

  const direction =
    delta > tolerance
      ? 'RISING'
      : delta < -tolerance
        ? 'FALLING'
        : 'STABLE';

  return {
    state: 'ANALYZED',
    points: clean,
    first,
    last,
    delta,
    percentChange:
      first === 0
        ? null
        : (delta / Math.abs(first)) * 100,
    direction,
    note:
      'Descriptive trend only; not a diagnosis or treatment recommendation.'
  };
}

module.exports = {
  analyzeTrend
};
