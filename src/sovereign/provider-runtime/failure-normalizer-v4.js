'use strict';

function classify({
  statusCode,
  message,
  networkError,
  timeout
}) {
  const status =
    Number(statusCode);

  const text =
    String(message || '')
      .toLowerCase();

  if (timeout === true) {
    return 'TIMEOUT';
  }

  if (networkError === true) {
    return 'NETWORK_FAILURE';
  }

  if (
    status === 401 ||
    status === 403
  ) {
    return 'AUTHORIZATION_FAILURE';
  }

  if (status === 429) {
    if (
      text.includes('billing') ||
      text.includes('quota') ||
      text.includes('credit')
    ) {
      return 'BILLING_OR_QUOTA_BLOCKED';
    }

    return 'RATE_LIMITED';
  }

  if (
    status >= 500 &&
    status <= 599
  ) {
    return 'TEMPORARY_PROVIDER_FAILURE';
  }

  if (
    status >= 400 &&
    status <= 499
  ) {
    return 'INVALID_REQUEST_OR_POLICY';
  }

  if (
    status >= 200 &&
    status <= 299
  ) {
    return 'SUCCESS';
  }

  return 'UNKNOWN_FAILURE';
}

function fallbackAllowed(
  failureClass
) {
  return [
    'TIMEOUT',
    'NETWORK_FAILURE',
    'RATE_LIMITED',
    'BILLING_OR_QUOTA_BLOCKED',
    'TEMPORARY_PROVIDER_FAILURE'
  ].includes(
    failureClass
  );
}

module.exports = {
  classify,
  fallbackAllowed
};
