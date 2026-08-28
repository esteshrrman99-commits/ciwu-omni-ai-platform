'use strict';

function clamp(value) {
  return Math.max(
    0,
    Math.min(
      1,
      Number(value) || 0
    )
  );
}

function scoreAttempt(attempt) {
  const baseline=
    attempt?.baseline?.ok === true
      ? 1
      : 0;

  const applied=
    attempt?.applyResult?.applied ===
      true
      ? 1
      : 0;

  const validation=
    attempt
      ?.candidateValidation
      ?.ok === true
      ? 1
      : 0;

  const noRegression=
    attempt
      ?.comparison
      ?.regressionCount === 0
      ? 1
      : 0;

  const verified=
    attempt
      ?.verdict
      ?.verified === true
      ? 1
      : 0;

  const score=
    (
      baseline * 0.10 +
      applied * 0.15 +
      validation * 0.25 +
      noRegression * 0.20 +
      verified * 0.30
    );

  return clamp(score);
}

function rank(attempts=[]) {
  const ranked=
    attempts.map(
      attempt => ({
        ordinal:
          attempt.ordinal,
        label:
          attempt.label,
        searchCandidateId:
          attempt.searchCandidateId,
        patchId:
          attempt.patchId,
        score:
          scoreAttempt(
            attempt
          ),
        verified:
          attempt
            ?.verdict
            ?.verified === true,
        regressionCount:
          attempt
            ?.comparison
            ?.regressionCount ??
          null
      })
    )
    .sort(
      (a,b) =>
        Number(b.verified) -
          Number(a.verified) ||
        b.score - a.score ||
        a.ordinal - b.ordinal
    );

  return {
    ok:true,
    confidenceIsTruth:false,
    optimizationIsAuthorization:false,
    rankingCount:
      ranked.length,
    best:
      ranked[0] || null,
    ranked
  };
}

module.exports={
  clamp,
  scoreAttempt,
  rank
};
