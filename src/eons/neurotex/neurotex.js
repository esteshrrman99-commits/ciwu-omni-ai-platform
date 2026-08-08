'use strict';

class NEUROTEX {
  score(model, requirements = []) {
    const capabilities = model.capabilities || [];

    const matches = requirements.filter(
      requirement => capabilities.includes(requirement)
    ).length;

    const capabilityScore =
      requirements.length === 0
        ? 0.5
        : matches / requirements.length;

    const reliability = Number(model.reliability || 0.5);
    const efficiency = Number(model.efficiency || 0.5);

    return Number(
      (
        capabilityScore * 0.6 +
        reliability * 0.25 +
        efficiency * 0.15
      ).toFixed(4)
    );
  }

  rank(models, requirements) {
    return models
      .map(model => ({
        ...model,
        eons_score: this.score(model, requirements)
      }))
      .sort((a, b) => b.eons_score - a.eons_score);
  }
}

module.exports = NEUROTEX;
