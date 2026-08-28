'use strict';

const {
  choose,
  rank
} = require(
  '../eons/adaptive-router-v6'
);

const {
  plan
} = require(
  '../federation/fallback-planner-v6'
);

function prepare({
  providers,
  attempted = []
}) {
  const selected =
    choose(providers);

  if (!selected.selected) {
    return {
      ready: false,
      reason:
        selected.reason
    };
  }

  const ranked =
    rank(providers);

  const first =
    plan({
      ranked,
      attempted
    });

  if (!first.continue) {
    return {
      ready: false,
      reason:
        first.reason
    };
  }

  return {
    ready: true,
    provider:
      first.entry.provider,
    model:
      first.entry.model,
    decision:
      selected.eons
  };
}

function next({
  providers,
  attempted,
  failureClass
}) {
  const ranked =
    rank(providers);

  return plan({
    ranked,
    attempted,
    failureClass
  });
}

function boundaries() {
  return {
    providerMustBeCertified:
      true,

    productionExecution:
      false,

    filesystemMutation:
      false,

    autonomousGitPush:
      false,

    purchaseAuthorization:
      false
  };
}

module.exports = {
  prepare,
  next,
  boundaries
};
