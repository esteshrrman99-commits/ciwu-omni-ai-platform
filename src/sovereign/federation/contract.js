'use strict';

function normalizeProviderResult({
  provider,
  model,
  text,
  usage = null,
  cost = null,
  provenance = null
}) {
  if (!provider) throw new TypeError('PROVIDER_REQUIRED');
  if (!model) throw new TypeError('MODEL_REQUIRED');

  return {
    provider,
    model,
    text: String(text || ''),
    usage,
    cost,
    provenance,
    receivedAt: new Date().toISOString()
  };
}

function classifyProviderFailure(error = {}) {
  const status = Number(error.status || 0);
  const message = String(
    error.message ||
    error.detail ||
    ''
  ).toLowerCase();

  if (
    status === 429 &&
    (
      message.includes('credit') ||
      message.includes('billing') ||
      message.includes('quota')
    )
  ) {
    return {
      class: 'CAPACITY_OR_BILLING_BLOCK',
      fallbackEligible: true
    };
  }

  if (status === 401 || status === 403) {
    return {
      class: 'AUTHENTICATION_OR_PERMISSION_FAILURE',
      fallbackEligible: true
    };
  }

  if (status >= 500) {
    return {
      class: 'PROVIDER_TRANSIENT_FAILURE',
      fallbackEligible: true
    };
  }

  return {
    class: 'UNKNOWN_PROVIDER_FAILURE',
    fallbackEligible: false
  };
}

module.exports = {
  normalizeProviderResult,
  classifyProviderFailure
};
