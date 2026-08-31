'use strict';

function create({
  parentSha,
  originalCandidate,
  oldPublicIndexSha,
  newProductSha
}={}) {
  return {
    schema:
      'CIWU_FUSION_ROLLBACK_MANIFEST_V1',
    parentSha,
    originalCandidate,
    oldPublicIndexSha,
    newProductSha,
    rollbackMethod:
      'git restore --source=<CERTIFIED_PARENT> --staged --worktree -- .',
    protectedUntrackedDataPreserved:true,
    gitCleanForbidden:true,
    forcePushForbidden:true
  };
}

module.exports={
  create
};
