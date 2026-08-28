'use strict';

const {
  rank
} = require(
  '../eons/provider-score'
);

function eligible(
  candidate
) {
  return (
    candidate &&
    candidate.certified === true &&
    candidate.costClass ===
      'ZERO_VERIFIED' &&
    candidate.available === true &&
    candidate.circuitOpen !==
      true
  );
}

function order(
  candidates
) {
  return rank(
    candidates.filter(
      eligible
    )
  );
}

function next({
  candidates,
  attempted = []
}) {
  const used =
    new Set(
      attempted
    );

  return (
    order(candidates)
      .find(
        candidate =>
          !used.has(
            candidate.id
          )
      ) ||
    null
  );
}

function explain(
  candidates
) {
  return candidates.map(
    candidate => ({
      id:
        candidate.id,
      eligible:
        eligible(
          candidate
        ),
      reason:
        eligible(candidate)
          ? 'ZERO_COST_CERTIFIED_AVAILABLE'
          : 'NOT_ELIGIBLE'
    })
  );
}

module.exports = {
  eligible,
  order,
  next,
  explain
};
