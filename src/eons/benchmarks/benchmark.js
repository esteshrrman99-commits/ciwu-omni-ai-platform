'use strict';

class BenchmarkEngine {
  evaluate(model, results = {}) {
    const categories = [
      'reasoning',
      'coding',
      'mathematics',
      'science',
      'vision',
      'audio',
      'agentic',
      'tool_use',
      'long_context',
      'reliability'
    ];

    const values = categories
      .map(category => Number(results[category]))
      .filter(value => Number.isFinite(value));

    const score = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : null;

    return {
      model_id: model.model_id || model.id,
      categories,
      measured_score: score,
      benchmarked_at: new Date().toISOString()
    };
  }
}

module.exports = BenchmarkEngine;
