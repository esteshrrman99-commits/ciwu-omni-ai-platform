'use strict';

const REQUIRED_GATES=Object.freeze([
  'dimensionsValid',
  'provenanceValid',
  'validationPassed',
  'noCriticalRegression',
  'authorizationValid'
]);

function judge({
  critic,
  gates={},
  evidenceScore=0
}={}) {
  if (
    !critic ||
    critic.schema!=='CIWU_CORTEX_CRITIC_V1'
  ) {
    throw new Error('JUDGE_CRITIC_REQUIRED');
  }

  const normalizedScore=Number(evidenceScore);

  if (
    !Number.isFinite(normalizedScore) ||
    normalizedScore<0 ||
    normalizedScore>1
  ) {
    throw new Error('JUDGE_EVIDENCE_SCORE_INVALID');
  }

  const failedGates=REQUIRED_GATES.filter(
    key=>gates[key]!==true
  );

  const verified=
    critic.acceptable===true &&
    failedGates.length===0 &&
    normalizedScore>=0.95;

  return Object.freeze({
    schema:'CIWU_CORTEX_JUDGE_V1',
    verified,
    disposition:
      verified
        ? 'VERIFIED_CANDIDATE_FOR_HUMAN_REVIEW'
        : 'ABSTAIN_OR_REPAIR',
    evidenceScore:normalizedScore,
    failedGates,
    productionApplyAuthority:false,
    gitCommitAuthority:false,
    gitPushAuthority:false,
    deploymentAuthority:false,
    universalSuperiorityClaim:false
  });
}

module.exports={
  REQUIRED_GATES,
  judge
};
