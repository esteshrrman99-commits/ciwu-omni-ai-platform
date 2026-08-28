'use strict';

function build(entries=[]) {
  const rows=
    entries.map(entry => ({
      provider:entry.provider,
      model:entry.model,

      configured:
        entry.configured === true,

      certified:
        entry.certified === true,

      priceFresh:
        entry.priceFresh === true,

      health:
        entry.health || 'UNKNOWN',

      circuitOpen:
        entry.circuitOpen === true,

      revoked:
        entry.revoked === true,

      score:
        Number.isFinite(
          Number(entry.score)
        )
          ? Number(entry.score)
          : 0,

      eligible:
        entry.configured === true &&
        entry.certified === true &&
        entry.priceFresh === true &&
        entry.health === 'HEALTHY' &&
        entry.circuitOpen !== true &&
        entry.revoked !== true
    }));

  return rows.sort(
    (a,b) =>
      Number(b.eligible) -
      Number(a.eligible) ||
      b.score-a.score
  );
}

module.exports={ build };
