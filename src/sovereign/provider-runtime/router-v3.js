'use strict';

const {
  adjustedScore
} = require(
  './provider-penalty'
);

function eligible(
  provider,
  {
    paidAuthorized = false,
    remainingBudgetUsd = 0
  } = {}
) {
  const reasons = [];

  if (
    provider.certified !==
    true
  ) {
    reasons.push(
      'NOT_CERTIFIED'
    );
  }

  if (
    provider.available !==
    true
  ) {
    reasons.push(
      'NOT_AVAILABLE'
    );
  }

  if (
    provider.costClass ===
    'UNKNOWN'
  ) {
    reasons.push(
      'UNKNOWN_COST'
    );
  }

  if (
    provider.costClass ===
      'PAID' &&
    paidAuthorized !== true
  ) {
    reasons.push(
      'PAID_NOT_AUTHORIZED'
    );
  }

  if (
    Number(
      provider.projectedCostUsd ||
      0
    ) >
    Number(
      remainingBudgetUsd
    )
  ) {
    reasons.push(
      'INSUFFICIENT_BUDGET'
    );
  }

  return {
    eligible:
      reasons.length === 0,
    reasons
  };
}

function choose(
  providers,
  options
) {
  const evaluated =
    providers.map(
      provider => {
        const gate =
          eligible(
            provider,
            options
          );

        const score =
          gate.eligible
            ? adjustedScore({
                baseScore:
                  provider.baseScore,
                classification:
                  provider.lastFailure ||
                  'SUCCESS'
              })
            : 0;

        return {
          id:
            provider.id,
          gate,
          score,
          provider
        };
      }
    );

  const selected =
    [...evaluated]
      .filter(
        x =>
          x.gate.eligible
      )
      .sort(
        (a,b) =>
          b.score -
          a.score
      )[0] ||
    null;

  return {
    selected:
      selected
        ? selected.id
        : null,

    selectedScore:
      selected
        ? selected.score
        : 0,

    evaluated:
      evaluated.map(
        x => ({
          id:
            x.id,
          eligible:
            x.gate.eligible,
          reasons:
            x.gate.reasons,
          score:
            x.score
        })
      )
  };
}

module.exports = {
  eligible,
  choose
};
