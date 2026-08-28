'use strict';

function authorize({
  repairCertified,
  evidenceReplayValid,
  confidence,
  humanApprovalRequired = false,
  humanApproved = false
}) {
  if (
    repairCertified !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'REPAIR_NOT_CERTIFIED'
    };
  }

  if (
    evidenceReplayValid !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'EVIDENCE_REPLAY_INVALID'
    };
  }

  if (
    Number(confidence) <
    0.8
  ) {
    return {
      allowed: false,
      reason:
        'CONFIDENCE_BELOW_THRESHOLD'
    };
  }

  if (
    humanApprovalRequired &&
    humanApproved !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'HUMAN_APPROVAL_REQUIRED'
    };
  }

  return {
    allowed: true,
    reason:
      'PROMOTION_AUTHORIZED'
  };
}

module.exports = {
  authorize
};
