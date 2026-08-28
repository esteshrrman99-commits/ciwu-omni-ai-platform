'use strict';

function evaluate({
  billingBlocked,
  authenticationFailure,
  circuitOpen,
  repeatedFailures,
  evidenceStale
}) {
  const reasons = [];

  if (billingBlocked)
    reasons.push(
      'BILLING_BLOCKED'
    );

  if (authenticationFailure)
    reasons.push(
      'AUTHENTICATION_FAILURE'
    );

  if (circuitOpen)
    reasons.push(
      'CIRCUIT_OPEN'
    );

  if (repeatedFailures)
    reasons.push(
      'REPEATED_FAILURES'
    );

  if (evidenceStale)
    reasons.push(
      'EVIDENCE_STALE'
    );

  return {
    demote:
      reasons.length > 0,
    reasons
  };
}

module.exports = {
  evaluate
};
