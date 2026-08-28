'use strict';

function bounded(
  value
) {
  return Math.max(
    0,
    Math.min(
      1,
      Number(value)
    )
  );
}

function calibrate({
  accuracy,
  successRate,
  latencyScore,
  evidenceConfidence
}) {
  return {
    quality:
      bounded(
        accuracy
      ),

    reliability:
      bounded(
        successRate
      ),

    latency:
      1 -
      bounded(
        latencyScore
      ),

    evidence:
      bounded(
        evidenceConfidence
      ),

    cost:
      0
  };
}

module.exports = {
  bounded,
  calibrate
};
