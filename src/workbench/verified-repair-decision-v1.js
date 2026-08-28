'use strict';

function decide({
  patch,
  validation,
  comparison
}={}) {
  const verified=
    Boolean(
      patch?.applied === true &&
      validation?.ok === true &&
      comparison
        ?.candidateAcceptable === true &&
      comparison
        ?.regressionCount === 0
    );

  return {
    ok:true,
    verified,
    status:
      verified
        ? 'SANDBOX_VERIFIED_CANDIDATE'
        : 'SANDBOX_CANDIDATE_REJECTED',
    eligibleForHumanReview:
      verified,
    productionApplyAuthorized:false,
    gitCommitAuthorized:false,
    gitPushAuthorized:false,
    deploymentAuthorized:false,
    purchaseAuthorized:false,
    requiresExplicitSeparateAuthorization:
      true
  };
}

module.exports={decide};
