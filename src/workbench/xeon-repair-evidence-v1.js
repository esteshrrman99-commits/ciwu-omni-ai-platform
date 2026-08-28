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

function build({
  patchId,
  workspaceManifest,
  applyResult,
  validation,
  comparison,
  decision
}={}) {
  const evidence={
    schema:
      'CIWU_XEON_REPAIR_EVIDENCE_V1',
    patchId:
      String(patchId || ''),
    workspaceManifest,
    applyResult,
    validation,
    comparison,
    decision,
    providerCalls:false,
    paidProviderCalls:false,
    productionMutation:false,
    autonomousGitMutation:false,
    arbitraryShell:false
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
  build
};
