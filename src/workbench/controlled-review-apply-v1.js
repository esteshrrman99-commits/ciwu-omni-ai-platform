'use strict';

const fs=require('node:fs');
const path=require('node:path');

const xeon=
  require('./xeon-sandbox-patch-applier-v1');

function assertReviewWorkspace(
  workspace
) {
  const resolved=
    path.resolve(
      String(workspace || '')
    );

  const tmp=
    path.resolve(
      require('node:os').tmpdir()
    );

  if (
    !resolved.startsWith(
      tmp + path.sep
    ) ||
    !path.basename(
      resolved
    ).startsWith(
      'ciwu-review-'
    )
  ) {
    throw new Error(
      'CONTROLLED_APPLY_WORKSPACE_DENIED'
    );
  }

  return resolved;
}

function apply({
  workspace,
  proposal,
  approval
}={}) {
  const root=
    assertReviewWorkspace(
      workspace
    );

  if (
    !approval ||
    approval.verified !== true
  ) {
    throw new Error(
      'CONTROLLED_APPLY_APPROVAL_REQUIRED'
    );
  }

  if (
    approval.proposalId !==
      proposal?.proposalId ||
    approval.evidenceHash !==
      proposal?.evidenceHash ||
    approval.baseSha !==
      proposal?.baseSha
  ) {
    throw new Error(
      'CONTROLLED_APPLY_BINDING_MISMATCH'
    );
  }

  if (
    !fs.statSync(root)
      .isDirectory()
  ) {
    throw new Error(
      'CONTROLLED_APPLY_WORKSPACE_INVALID'
    );
  }

  const candidate={
    schema:
      'CIWU_CODEX_STRUCTURED_PATCH_V1',
    objective:
      proposal.objective,
    operations:
      proposal.operations,
    productionTarget:false,
    sandboxOnly:true,
    generatedByProvider:false,
    providerCallRequired:false,
    gitMutation:false
  };

  const result=
    xeon.apply({
      workspace:root,
      candidate
    });

  return {
    ...result,
    controlledApply:true,
    reviewWorkspaceOnly:true,
    approvalRequired:true,
    productionApply:false,
    gitMutation:false,
    deploymentMutation:false
  };
}

module.exports={
  assertReviewWorkspace,
  apply
};
