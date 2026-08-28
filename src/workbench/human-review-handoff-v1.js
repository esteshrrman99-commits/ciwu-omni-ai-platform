'use strict';

function build({
  objective,
  selectedTests,
  ranking,
  classifications,
  evidence
}={}) {
  const best=
    ranking?.best || null;

  const eligible=
    Boolean(
      best &&
      best.verified === true &&
      Number(best.score) >= 0.95
    );

  return {
    ok:true,
    schema:
      'CIWU_HUMAN_REVIEW_HANDOFF_V1',
    objective:
      String(objective || ''),
    selectedTests:
      selectedTests || [],
    recommendation:
      eligible
        ? 'REVIEW_VERIFIED_SANDBOX_CANDIDATE'
        : 'NO_CANDIDATE_READY',
    candidate:
      eligible
        ? best
        : null,
    classifications,
    evidenceHash:
      evidence?.evidenceHash ||
      null,
    humanReviewRequired:true,
    productionApplyAuthorized:false,
    gitCommitAuthorized:false,
    gitPushAuthorized:false,
    deploymentAuthorized:false,
    purchaseAuthorized:false,
    automaticEscalation:false,
    explicitSeparateAuthorizationRequired:
      true
  };
}

module.exports={build};
