'use strict';

const crypto =
  require('node:crypto');

function hash(
  object
) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(
        object
      )
    )
    .digest('hex');
}

function record({
  repairEvidence,
  promotedFact
}) {
  if (
    !repairEvidence ||
    repairEvidence
      .certification
      ?.certified !==
      true
  ) {
    throw new Error(
      'UNCERTIFIED_REPAIR'
    );
  }

  return {
    schema:
      'CIWU_NEUROTEX_CERTIFICATION_REPLAY_V1',

    repairEvidenceHash:
      hash(
        repairEvidence
      ),

    promotedFactHash:
      hash(
        promotedFact
      ),

    promotedFact,

    createdAt:
      new Date()
        .toISOString()
  };
}

function replay({
  replayRecord,
  repairEvidence
}) {
  if (
    replayRecord
      .repairEvidenceHash !==
    hash(
      repairEvidence
    )
  ) {
    return {
      valid: false,
      reason:
        'REPAIR_EVIDENCE_HASH_MISMATCH'
    };
  }

  return {
    valid: true,
    reason:
      'CERTIFICATION_REPLAY_VALID'
  };
}

module.exports = {
  hash,
  record,
  replay
};
