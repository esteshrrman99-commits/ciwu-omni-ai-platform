'use strict';

function classify({
  httpStatus,
  message = '',
  timeout = false,
  networkError = false
}) {
  const text =
    String(message)
      .toLowerCase();

  if (timeout)
    return 'TIMEOUT';

  if (networkError)
    return 'NETWORK_FAILURE';

  if (
    httpStatus === 401 ||
    httpStatus === 403
  ) {
    return 'AUTHORIZATION_FAILURE';
  }

  if (httpStatus === 429) {
    if (
      text.includes('credit') ||
      text.includes('billing') ||
      text.includes('quota')
    ) {
      return 'BILLING_OR_QUOTA_BLOCKED';
    }

    return 'RATE_LIMITED';
  }

  if (
    httpStatus >= 500 &&
    httpStatus <= 599
  ) {
    return 'TEMPORARY_PROVIDER_FAILURE';
  }

  if (
    httpStatus >= 400 &&
    httpStatus <= 499
  ) {
    return 'INVALID_REQUEST_OR_POLICY';
  }

  if (
    httpStatus >= 200 &&
    httpStatus <= 299
  ) {
    return 'SUCCESS';
  }

  return 'UNKNOWN_FAILURE';
}

function fallbackEligible(
  classification
) {
  return [
    'TIMEOUT',
    'NETWORK_FAILURE',
    'RATE_LIMITED',
    'BILLING_OR_QUOTA_BLOCKED',
    'TEMPORARY_PROVIDER_FAILURE'
  ].includes(
    classification
  );
}

module.exports = {
  classify,
  fallbackEligible
};
