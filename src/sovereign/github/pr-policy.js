'use strict';

function mayExecute({
  plan,
  explicitHumanApproval,
  baseCommitStillCurrent
}) {
  if (!plan?.dryRun)
    return false;

  if (
    explicitHumanApproval !==
    true
  ) return false;

  if (
    baseCommitStillCurrent !==
    true
  ) return false;

  if (
    plan.forcePush === true
  ) return false;

  return true;
}

module.exports = {
  mayExecute
};
