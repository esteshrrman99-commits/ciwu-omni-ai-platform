'use strict';

const POLICY =
  Object.freeze({
    autonomousBranchCreate:
      false,

    autonomousCommit:
      false,

    autonomousPush:
      false,

    autonomousPullRequest:
      false,

    forcePush:
      false,

    explicitHumanApprovalRequired:
      true
  });

module.exports = {
  POLICY
};
