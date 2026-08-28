'use strict';

function derive({
  configured = false,
  reachable = false,
  inferenceCertified = false,
  billingBlocked = false,
  rateLimited = false,
  priceVerified = false
} = {}) {
  if (!configured)
    return 'UNCONFIGURED';

  if (billingBlocked)
    return 'BILLING_BLOCKED';

  if (rateLimited)
    return 'RATE_LIMITED';

  if (!reachable)
    return 'CONFIGURED_UNREACHABLE';

  if (!priceVerified)
    return 'REACHABLE_COST_UNVERIFIED';

  if (!inferenceCertified)
    return 'REACHABLE_UNCERTIFIED';

  return 'CERTIFIED_AVAILABLE';
}

module.exports = {
  derive
};
