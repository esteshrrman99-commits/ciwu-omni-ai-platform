'use strict';

const crypto=require('node:crypto');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

function renderOperation(
  operation,
  index
) {
  return [
    `--- a/${operation.file}`,
    `+++ b/${operation.file}`,
    `@@ CIWU-OP-${index + 1} @@`,
    ...String(operation.before)
      .split('\n')
      .map(line => `-${line}`),
    ...String(operation.after)
      .split('\n')
      .map(line => `+${line}`)
  ].join('\n');
}

function build(proposal) {
  if (
    !proposal ||
    proposal.schema !==
      'CIWU_REPAIR_PROPOSAL_V1'
  ) {
    throw new Error(
      'DIFF_PROPOSAL_INVALID'
    );
  }

  const diff=
    proposal.operations
      .map(renderOperation)
      .join('\n\n');

  const envelope={
    schema:
      'CIWU_PROPOSAL_DIFF_ENVELOPE_V1',
    proposalId:
      proposal.proposalId,
    baseSha:
      proposal.baseSha,
    evidenceHash:
      proposal.evidenceHash,
    operationCount:
      proposal.operations.length,
    diff,
    diffSha256:
      sha256(diff),
    reviewRequired:true,
    mutationPerformed:false
  };

  return Object.freeze(
    envelope
  );
}

module.exports={
  sha256,
  renderOperation,
  build
};
