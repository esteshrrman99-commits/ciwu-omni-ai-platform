'use strict';

const BOUNDARY =
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

    productionMutation:
      false,

    humanApprovalRequired:
      true
  });

function assertSafe() {
  if (
    BOUNDARY.forcePush !==
      false ||
    BOUNDARY.autonomousPush !==
      false
  ) {
    throw new Error(
      'GITHUB_BOUNDARY_INVALID'
    );
  }

  return true;
}

module.exports = {
  BOUNDARY,
  assertSafe
};
