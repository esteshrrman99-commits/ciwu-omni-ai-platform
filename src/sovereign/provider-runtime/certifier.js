'use strict';

const crypto =
  require('node:crypto');

const {
  get
} = require(
  './adapter-registry'
);

const providerHealth =
  require(
    '../federation/health'
  );

function authorizeRealInference({
  realInferenceAuthorized,
  costClass,
  paidProviderAuthorized
}) {
  if (
    realInferenceAuthorized !== true
  ) {
    return {
      authorized: false,
      reason:
        'REAL_INFERENCE_NOT_AUTHORIZED'
    };
  }

  if (
    costClass === 'UNKNOWN'
  ) {
    return {
      authorized: false,
      reason:
        'UNKNOWN_COST'
    };
  }

  if (
    costClass === 'PAID' &&
    paidProviderAuthorized !== true
  ) {
    return {
      authorized: false,
      reason:
        'PAID_PROVIDER_NOT_AUTHORIZED'
    };
  }

  if (
    !['FREE','PAID']
      .includes(costClass)
  ) {
    return {
      authorized: false,
      reason:
        'INVALID_COST_CLASS'
    };
  }

  return {
    authorized: true,
    reason:
      'AUTHORIZED'
  };
}

async function certify({
  provider,
  model,
  costClass = 'UNKNOWN',
  realInferenceAuthorized = false,
  paidProviderAuthorized = false
}) {
  const authorization =
    authorizeRealInference({
      realInferenceAuthorized,
      costClass,
      paidProviderAuthorized
    });

  if (!authorization.authorized) {
    return {
      provider,
      certified: false,
      state:
        'BLOCKED_BY_POLICY',
      reason:
        authorization.reason
    };
  }

  const adapter =
    get(provider);

  if (!adapter) {
    return {
      provider,
      certified: false,
      state:
        'UNSUPPORTED_PROVIDER'
    };
  }

  if (!adapter.configured()) {
    return {
      provider,
      certified: false,
      state:
        'UNCONFIGURED'
    };
  }

  const nonce =
    crypto
      .randomBytes(12)
      .toString('hex');

  const expected =
    `CIWU-CERT-${nonce}`;

  try {
    const result =
      await adapter.chat({
        model,
        messages: [
          {
            role: 'user',
            content:
              `Reply with exactly ${expected}`
          }
        ],
        maxTokens: 64
      });

    const text =
      String(
        result.text || ''
      ).trim();

    const passed =
      text.includes(expected);

    return {
      provider,
      model:
        result.model || model || null,
      certified:
        passed,
      state:
        passed
          ? 'AVAILABLE'
          : 'RESPONSE_MISMATCH',
      responseHash:
        crypto
          .createHash('sha256')
          .update(text)
          .digest('hex'),
      usage:
        result.usage || null
    };

  } catch (error) {
    const classified =
      providerHealth
        .classify(error);

    return {
      provider,
      certified: false,
      state:
        classified.state,
      fallbackEligible:
        classified.fallbackEligible
    };
  }
}

module.exports = {
  authorizeRealInference,
  certify
};
