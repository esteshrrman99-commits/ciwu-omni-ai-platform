'use strict';

const BOUNDARY =
  Object.freeze({
    branchCreateWithoutApproval:
      false,

    commitWithoutApproval:
      false,

    pushWithoutApproval:
      false,

    pullRequestWithoutApproval:
      false,

    forcePush:
      false,

    productionMutationFromModel:
      false
  });

module.exports = {
  BOUNDARY
};
