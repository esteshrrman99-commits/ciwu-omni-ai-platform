'use strict';

const crypto=require('node:crypto');

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function fuse({
  search,
  classifications,
  ranking
}={}) {
  const verified=
    search
      ?.attempts
      ?.filter(
        attempt =>
          attempt
            ?.verdict
            ?.verified === true
      ) || [];

  const evidence={
    schema:
      'CIWU_REPAIR_SEARCH_EVIDENCE_V1',
    attemptCount:
      search?.attemptCount || 0,
    verifiedCount:
      verified.length,
    classifications,
    ranking,
    confidence:
      ranking?.best?.score ?? 0,
    confidenceIsTruth:false,
    correlationIsCausation:false,
    optimizationIsAuthorization:false,
    productionMutation:false,
    gitPushAuthority:false
  };

  return {
    ok:true,
    evidenceHash:
      sha(evidence),
    evidence
  };
}

module.exports={
  sha,
  fuse
};
