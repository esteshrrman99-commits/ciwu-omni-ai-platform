'use strict';

function efficiency(p) {
  const cost =
    Number(p.projectedCostUsd);

  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) return -Infinity;

  const quality =
    Number(p.quality || 0);

  const confidence =
    Number(p.confidence || 0);

  const informationGain =
    Number(p.informationGain || 0);

  const testPass =
    Number(p.testPassRate || 0);

  const reliability =
    Number(p.reliability || 0);

  return (
    quality *
    confidence *
    informationGain *
    testPass *
    reliability
  ) / (cost + 1e-6);
}

function select(
  providers,
  {
    minimumQuality = 0.70,
    paidAuthorized = false,
    remainingUsd = 100
  } = {}
) {
  const allowed =
    providers
      .filter(p => p.available === true)
      .filter(p => p.verified === true)
      .filter(p =>
        Number.isFinite(
          p.projectedCostUsd
        )
      )
      .filter(p =>
        Number(p.quality || 0) >=
        minimumQuality
      )
      .filter(p =>
        p.projectedCostUsd === 0 ||
        paidAuthorized === true
      )
      .filter(p =>
        p.projectedCostUsd <=
        remainingUsd
      )
      .map(p => ({
        ...p,
        efficiency: efficiency(p)
      }));

  const free =
    allowed
      .filter(p =>
        p.projectedCostUsd === 0
      )
      .sort((a, b) =>
        b.efficiency - a.efficiency
      );

  if (free.length)
    return free[0];

  return allowed.sort(
    (a, b) =>
      b.efficiency - a.efficiency
  )[0] || null;
}

module.exports = {
  efficiency,
  select
};
