'use strict';

const PENALTIES = Object.freeze({
  SUCCESS: 0,
  RATE_LIMITED: 0.15,
  TIMEOUT: 0.20,
  NETWORK_FAILURE: 0.25,
  TEMPORARY_PROVIDER_FAILURE: 0.30,
  BILLING_OR_QUOTA_BLOCKED: 1,
  AUTHORIZATION_FAILURE: 1,
  INVALID_REQUEST_OR_POLICY: 0.50,
  UNKNOWN_FAILURE: 1
});

function penalty(
  classification
) {
  return (
    PENALTIES[
      classification
    ] ?? 1
  );
}

function adjustedScore({
  baseScore,
  classification
}) {
  return Math.max(
    0,
    Number(baseScore) *
    (
      1 -
      penalty(
        classification
      )
    )
  );
}

module.exports = {
  PENALTIES,
  penalty,
  adjustedScore
};
