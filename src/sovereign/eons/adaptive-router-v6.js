'use strict';

function clamp01(value) {
  return Math.max(
    0,
    Math.min(
      1,
      Number(value)
    )
  );
}

function score(entry) {
  if (
    entry?.runtimeEligible !==
    true
  ) {
    return null;
  }

  const quality =
    clamp01(entry.quality);

  const reliability =
    clamp01(entry.reliability);

  const speed =
    clamp01(entry.speed);

  const costEfficiency =
    clamp01(entry.costEfficiency);

  const evidenceConfidence =
    clamp01(
      entry.evidenceConfidence
    );

  const risk =
    clamp01(entry.risk);

  const uncertainty =
    clamp01(entry.uncertainty);

  const resistance =
    1 +
    risk +
    uncertainty;

  const numerator =
    quality *
    reliability *
    speed *
    costEfficiency *
    evidenceConfidence;

  const value =
    numerator /
    resistance;

  return {
    score:
      clamp01(value),

    components: {
      quality,
      reliability,
      speed,
      costEfficiency,
      evidenceConfidence,
      risk,
      uncertainty
    }
  };
}

function rank(entries) {
  return (entries || [])
    .map(entry => ({
      entry,
      evaluation:
        score(entry)
    }))
    .filter(
      item =>
        item.evaluation !== null
    )
    .sort(
      (a,b) =>
        b.evaluation.score -
        a.evaluation.score
    );
}

function choose(
  entries,
  minimumScore = 0.10
) {
  const ranked =
    rank(entries);

  if (!ranked.length) {
    return {
      selected: false,
      reason:
        'NO_RUNTIME_ELIGIBLE_PROVIDER'
    };
  }

  const best =
    ranked[0];

  if (
    best.evaluation.score <
    Number(minimumScore)
  ) {
    return {
      selected: false,
      reason:
        'NO_PROVIDER_ABOVE_THRESHOLD'
    };
  }

  return {
    selected: true,
    entry:
      best.entry,
    eons:
      best.evaluation
  };
}

module.exports = {
  clamp01,
  score,
  rank,
  choose
};
