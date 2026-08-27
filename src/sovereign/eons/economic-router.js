'use strict';

const {
  authorizeSpend
} = require('./budget');

function valueEfficiency({
  quality,
  confidence,
  informationGain,
  testPassRate,
  projectedCostUsd
}) {
  const values = [
    quality,
    confidence,
    informationGain,
    testPassRate,
    projectedCostUsd
  ];

  if (!values.every(Number.isFinite))
    return -Infinity;

  if (projectedCostUsd < 0)
    return -Infinity;

  const numerator =
    quality *
    confidence *
    informationGain *
    testPassRate;

  return numerator /
    (projectedCostUsd + 0.000001);
}

function choose(
  providers,
  {
    monthlySpentUsd = 0,
    monthlyCapUsd = 100,
    paidProviderAuthorized = false,
    minimumQuality = 0.70
  } = {}
) {
  const qualified = [];

  for (const provider of providers) {
    if (
      provider.available !== true ||
      provider.verified !== true
    ) continue;

    if (
      !Number.isFinite(
        provider.projectedCostUsd
      )
    ) continue;

    if (
      Number(provider.quality) <
      minimumQuality
    ) continue;

    const spend =
      authorizeSpend({
        monthlySpentUsd,
        projectedRequestUsd:
          provider.projectedCostUsd,
        monthlyCapUsd,
        paidProviderAuthorized
      });

    if (!spend.authorized)
      continue;

    qualified.push({
      ...provider,
      valueEfficiency:
        valueEfficiency({
          quality:
            provider.quality,
          confidence:
            provider.confidence,
          informationGain:
            provider.informationGain,
          testPassRate:
            provider.testPassRate,
          projectedCostUsd:
            provider.projectedCostUsd
        })
    });
  }

  qualified.sort((a, b) => {
    const afree =
      a.projectedCostUsd === 0;

    const bfree =
      b.projectedCostUsd === 0;

    if (afree && !bfree)
      return -1;

    if (bfree && !afree)
      return 1;

    return (
      b.valueEfficiency -
      a.valueEfficiency
    );
  });

  return qualified[0] || null;
}

module.exports = {
  valueEfficiency,
  choose
};
