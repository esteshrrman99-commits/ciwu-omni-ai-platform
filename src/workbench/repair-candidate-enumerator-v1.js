'use strict';

const crypto=require('node:crypto');

const searchPolicy=
  require('./autonomous-repair-search-policy-v1');

const codex=
  require('./codex-structured-patch-generator-v1');

function candidateId(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex')
    .slice(0,20);
}

function enumerate({
  objective,
  candidates=[]
}={}) {
  const goal=
    searchPolicy
      .normalizeObjective(
        objective
      );

  const safeCandidates=
    searchPolicy
      .assertCandidates(
        candidates
      );

  const enumerated=
    safeCandidates.map(
      (candidate,index) => {
        const generated=
          codex.generate({
            objective:
              `${goal} [candidate ${index + 1}: ${candidate.label}]`,
            operations:[
              candidate.operation
            ]
          });

        return {
          ordinal:index + 1,
          label:
            candidate.label,
          searchCandidateId:
            candidateId({
              label:
                candidate.label,
              operation:
                candidate.operation
            }),
          patchId:
            generated.patchId,
          candidate:
            generated.candidate
        };
      }
    );

  return {
    ok:true,
    bounded:true,
    autonomousSearch:true,
    providerGenerated:false,
    providerCalls:false,
    candidateCount:
      enumerated.length,
    candidates:
      enumerated,
    productionMutation:false
  };
}

module.exports={
  candidateId,
  enumerate
};
