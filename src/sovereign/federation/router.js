'use strict';

function scoreProvider(p) {
  const quality = Number(p.quality || 0);
  const reliability = Number(p.reliability || 0);
  const coding = Number(p.coding || 0);
  const availability = p.available === true ? 1 : 0;

  const cost = Number(p.estimatedCostUsd);

  if (!Number.isFinite(cost) || cost < 0)
    return -Infinity;

  return (
    quality *
    reliability *
    coding *
    availability
  ) / (cost + 0.000001);
}

function route(providers, policy) {
  if (!Array.isArray(providers))
    throw new TypeError('PROVIDERS_REQUIRED');

  const candidates = providers
    .filter(p => p.available === true)
    .filter(p => p.verified === true)
    .filter(p => Number.isFinite(p.estimatedCostUsd))
    .filter(p =>
      p.estimatedCostUsd === 0 ||
      policy.allowPaid === true
    )
    .filter(p =>
      p.estimatedCostUsd === 0 ||
      p.estimatedCostUsd <= policy.remainingMonthlyBudgetUsd
    )
    .sort((a, b) => {
      if (a.estimatedCostUsd === 0 &&
          b.estimatedCostUsd !== 0) return -1;

      if (b.estimatedCostUsd === 0 &&
          a.estimatedCostUsd !== 0) return 1;

      return scoreProvider(b) - scoreProvider(a);
    });

  return candidates[0] || null;
}

module.exports = {
  scoreProvider,
  route
};
