'use strict';

function rank(
  candidates
) {
  return [...candidates]
    .filter(
      x =>
        x.inferenceCertified ===
          true &&
        x.costCertified ===
          true &&
        Number.isFinite(
          Number(
            x.score
          )
        )
    )
    .sort(
      (a,b) =>
        Number(b.score) -
        Number(a.score)
    );
}

function winners(
  candidates,
  {
    minimumScore = 0.7,
    limit = 3
  } = {}
) {
  return rank(
    candidates
  )
    .filter(
      x =>
        Number(x.score) >=
        minimumScore
    )
    .slice(
      0,
      limit
    );
}

function promotionDecision(
  candidates,
  options
) {
  const selected =
    winners(
      candidates,
      options
    );

  return {
    promotedIds:
      selected.map(
        x => x.id
      ),

    abstain:
      selected.length === 0,

    candidateCount:
      candidates.length,

    eligibleCount:
      rank(
        candidates
      ).length
  };
}

module.exports = {
  rank,
  winners,
  promotionDecision
};
