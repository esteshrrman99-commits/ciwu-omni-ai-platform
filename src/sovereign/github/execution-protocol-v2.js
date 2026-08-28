'use strict';

function authorize({
  intent,
  explicitHumanApproval,
  expectedBaseCommit,
  currentBaseCommit,
  approvalTokenValid
}) {
  if (!intent) {
    return {
      allowed: false,
      reason:
        'INTENT_REQUIRED'
    };
  }

  if (
    explicitHumanApproval !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'HUMAN_APPROVAL_REQUIRED'
    };
  }

  if (
    approvalTokenValid !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'APPROVAL_TOKEN_INVALID'
    };
  }

  if (
    expectedBaseCommit !==
    currentBaseCommit
  ) {
    return {
      allowed: false,
      reason:
        'BASE_COMMIT_CHANGED'
    };
  }

  if (
    intent.forcePush ===
    true
  ) {
    return {
      allowed: false,
      reason:
        'FORCE_PUSH_FORBIDDEN'
    };
  }

  return {
    allowed: true,
    reason:
      'HUMAN_APPROVED_EXECUTION_READY'
  };
}

module.exports = {
  authorize
};
