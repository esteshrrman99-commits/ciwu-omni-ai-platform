'use strict';

function classifyAttempt(attempt) {
  if (
    attempt?.verdict?.verified ===
      true
  ) {
    return {
      class:
        'VERIFIED_CANDIDATE',
      severity:0,
      retryable:false
    };
  }

  const message=
    String(
      attempt?.failure?.message ||
      ''
    );

  if (
    message.includes(
      'ANCHOR_NOT_FOUND'
    )
  ) {
    return {
      class:
        'PATCH_ANCHOR_MISSING',
      severity:3,
      retryable:true
    };
  }

  if (
    message.includes(
      'ANCHOR_NOT_UNIQUE'
    )
  ) {
    return {
      class:
        'PATCH_ANCHOR_AMBIGUOUS',
      severity:4,
      retryable:true
    };
  }

  if (
    attempt
      ?.comparison
      ?.regressionCount > 0
  ) {
    return {
      class:
        'REGRESSION_DETECTED',
      severity:5,
      retryable:true
    };
  }

  if (
    attempt
      ?.candidateValidation
      ?.ok === false
  ) {
    return {
      class:
        'VALIDATION_FAILURE',
      severity:4,
      retryable:true
    };
  }

  if (
    attempt
      ?.baseline
      ?.ok === false
  ) {
    return {
      class:
        'BASELINE_INVALID',
      severity:5,
      retryable:false
    };
  }

  return {
    class:
      'UNVERIFIED',
    severity:4,
    retryable:false
  };
}

function classify(attempts=[]) {
  const results=
    attempts.map(
      attempt => ({
        ordinal:
          attempt.ordinal,
        searchCandidateId:
          attempt.searchCandidateId,
        ...classifyAttempt(
          attempt
        )
      })
    );

  return {
    ok:true,
    classificationCount:
      results.length,
    classifications:
      results
  };
}

module.exports={
  classifyAttempt,
  classify
};
