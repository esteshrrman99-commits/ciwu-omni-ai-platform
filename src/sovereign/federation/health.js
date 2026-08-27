'use strict';

const {
  classifyProviderFailure
} = require('./contract');

const environment =
  require('../providers/environment');

function classify(error) {
  const result =
    classifyProviderFailure({
      status: error?.status,
      message: error?.message
    });

  const text =
    String(error?.message || '')
      .toLowerCase();

  if (
    text.includes('credit') ||
    text.includes('billing')
  ) {
    return {
      state:
        'BILLING_BLOCKED',
      fallbackEligible: true
    };
  }

  if (
    text.includes('quota') ||
    text.includes('rate limit')
  ) {
    return {
      state:
        'QUOTA_OR_RATE_LIMIT',
      fallbackEligible: true
    };
  }

  if (
    text.includes('unconfigured') ||
    text.includes('required')
  ) {
    return {
      state:
        'UNCONFIGURED',
      fallbackEligible: true
    };
  }

  return {
    state: result.class,
    fallbackEligible:
      result.fallbackEligible
  };
}

function snapshot() {
  return {
    timestamp:
      new Date().toISOString(),

    environment:
      environment.publicStatus(),

    invariants: {
      missingCredentialIsAvailable:
        false,
      unknownCostIsFree:
        false,
      providerFailureIsGlobalFailure:
        false
    }
  };
}

module.exports = {
  classify,
  snapshot
};
