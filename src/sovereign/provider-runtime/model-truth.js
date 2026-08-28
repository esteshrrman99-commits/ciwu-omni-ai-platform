'use strict';

function derive({
  discovered,
  reachable,
  inferenceCertified,
  costCertified,
  billingBlocked
}) {
  if (
    discovered !== true
  ) {
    return 'NOT_DISCOVERED';
  }

  if (
    billingBlocked === true
  ) {
    return 'DISCOVERED_BILLING_BLOCKED';
  }

  if (
    reachable !== true
  ) {
    return 'DISCOVERED_REACHABILITY_UNKNOWN';
  }

  if (
    inferenceCertified !==
    true
  ) {
    return 'DISCOVERED_NOT_INFERENCE_CERTIFIED';
  }

  if (
    costCertified !==
    true
  ) {
    return 'INFERENCE_CERTIFIED_COST_UNVERIFIED';
  }

  return 'CERTIFIED_READY';
}

module.exports = {
  derive
};
