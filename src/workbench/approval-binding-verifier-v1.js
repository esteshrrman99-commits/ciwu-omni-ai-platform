'use strict';

const tokenCodec=
  require('./approval-token-v1');

const replay=
  require('./approval-replay-ledger-v1');

function verify({
  token,
  secret,
  proposal,
  currentBaseSha,
  now=Math.floor(
    Date.now() / 1000
  ),
  consumeReplay=false,
  ledgerDir,
  root=process.cwd()
}={}) {
  if (
    !proposal ||
    proposal.schema !==
      'CIWU_REPAIR_PROPOSAL_V1'
  ) {
    throw new Error(
      'APPROVAL_PROPOSAL_REQUIRED'
    );
  }

  const decoded=
    tokenCodec.decodeAndVerify({
      token,
      secret,
      now
    });

  const claims=
    decoded.claims;

  if (
    claims.proposalId !==
      proposal.proposalId
  ) {
    throw new Error(
      'APPROVAL_PROPOSAL_BINDING_MISMATCH'
    );
  }

  if (
    claims.evidenceHash !==
      proposal.evidenceHash
  ) {
    throw new Error(
      'APPROVAL_EVIDENCE_BINDING_MISMATCH'
    );
  }

  if (
    claims.baseSha !==
      proposal.baseSha
  ) {
    throw new Error(
      'APPROVAL_TOKEN_BASE_BINDING_MISMATCH'
    );
  }

  if (
    String(
      currentBaseSha || ''
    ).toLowerCase() !==
      proposal.baseSha
  ) {
    throw new Error(
      'APPROVAL_CURRENT_BASE_MISMATCH'
    );
  }

  let replayRecord=null;

  if (consumeReplay) {
    replayRecord=
      replay.consume({
        root,
        ledgerDir,
        jti:
          claims.jti,
        proposalId:
          claims.proposalId,
        exp:
          claims.exp,
        now
      });
  }

  return {
    verified:true,
    proposalId:
      claims.proposalId,
    evidenceHash:
      claims.evidenceHash,
    baseSha:
      claims.baseSha,
    scope:
      claims.scope,
    jti:
      claims.jti,
    exp:
      claims.exp,
    replayConsumed:
      Boolean(replayRecord),
    productionApplyAuthority:false,
    gitCommitAuthority:false,
    gitPushAuthority:false,
    deploymentAuthority:false
  };
}

module.exports={
  verify
};
