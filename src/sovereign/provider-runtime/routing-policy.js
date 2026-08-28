'use strict';

const {
  rank
} = require(
  '../eons/provider-score'
);

function select(
  candidates,
  {
    remainingBudgetUsd,
    paidAuthorized = false
  }
) {
  const eligible =
    candidates.filter(
      candidate => {

        if (
          candidate.certified !==
          true
        ) return false;

        if (
          candidate.costClass ===
          'UNKNOWN'
        ) return false;

        if (
          candidate.costClass ===
          'PAID' &&
          paidAuthorized !== true
        ) return false;

        if (
          Number(
            candidate
              .projectedCostUsd || 0
          ) >
          Number(
            remainingBudgetUsd
          )
        ) return false;

        return true;
      }
    );

  return (
    rank(eligible)[0] ||
    null
  );
}

module.exports = {
  select
};
