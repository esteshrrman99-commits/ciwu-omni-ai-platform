'use strict';

function promote({
  memory,
  candidate,
  testsPassed,
  evidenceValid,
  authorizationValid
}) {
  if (
    testsPassed !== true
  ) {
    return {
      promoted: false,
      reason:
        'TESTS_NOT_PASSED'
    };
  }

  if (
    evidenceValid !== true
  ) {
    return {
      promoted: false,
      reason:
        'EVIDENCE_INVALID'
    };
  }

  if (
    authorizationValid !== true
  ) {
    return {
      promoted: false,
      reason:
        'AUTHORIZATION_INVALID'
    };
  }

  const record =
    memory.rememberCertification({
      content:
        candidate.content,

      provenance:
        candidate.provenance,

      confidence:
        candidate.confidence ?? 1,

      tags: [
        ...(candidate.tags || []),
        'certified-learning'
      ]
    });

  return {
    promoted: true,
    record
  };
}

module.exports = {
  promote
};
