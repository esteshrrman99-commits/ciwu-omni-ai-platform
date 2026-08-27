'use strict';

function order(candidates) {
  return [...candidates]
    .filter(p => p.available === true)
    .filter(p => p.verified === true)
    .filter(p => Number.isFinite(p.projectedCostUsd))
    .sort((a, b) => {
      const ac = a.projectedCostUsd;
      const bc = b.projectedCostUsd;

      if (ac === 0 && bc !== 0) return -1;
      if (bc === 0 && ac !== 0) return 1;

      const aq =
        Number(a.quality || 0) *
        Number(a.reliability || 0);

      const bq =
        Number(b.quality || 0) *
        Number(b.reliability || 0);

      return bq - aq;
    });
}

module.exports = {
  order
};
