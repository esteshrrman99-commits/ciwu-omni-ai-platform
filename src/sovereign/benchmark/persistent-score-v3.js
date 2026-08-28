'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  provider,
  model,
  taskId,
  quality,
  latencyScore,
  reliability,
  costScore,
  receiptHash
}) {
  const metrics = {
    quality:
      Number(quality),

    latencyScore:
      Number(latencyScore),

    reliability:
      Number(reliability),

    costScore:
      Number(costScore)
  };

  for (
    const [name,value]
    of Object.entries(metrics)
  ) {
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {
      throw new Error(
        `INVALID_BENCHMARK_${name.toUpperCase()}`
      );
    }
  }

  if (!receiptHash) {
    throw new Error(
      'RECEIPT_HASH_REQUIRED'
    );
  }

  const score =
    (
      metrics.quality * 0.45 +
      metrics.latencyScore * 0.20 +
      metrics.reliability * 0.25 +
      metrics.costScore * 0.10
    );

  const base = {
    schema:
      'CIWU_BENCHMARK_SCORE_V3',

    provider,
    model,
    taskId,
    metrics,
    score,
    receiptHash,

    createdAt:
      new Date().toISOString()
  };

  return {
    ...base,
    benchmarkHash:
      hash(base)
  };
}

module.exports = {
  hash,
  create
};
