'use strict';

const crypto = require('node:crypto');

const PROVIDERS =
  Object.freeze([
    'openai',
    'groq',
    'gemini',
    'cloudflare',
    'huggingface',
    'local'
  ]);

function normalizeProvider(value) {
  const provider =
    String(value || '')
      .trim()
      .toLowerCase();

  if (!PROVIDERS.includes(provider)) {
    throw new Error(
      'PROVIDER_NOT_SUPPORTED'
    );
  }

  return provider;
}

function create({
  provider,
  model,
  costClass,
  maximumCostUsd,
  priceEvidenceHash,
  priceEvidenceFresh,
  explicitAuthorization
}) {
  const p =
    normalizeProvider(provider);

  if (!model) {
    throw new Error(
      'MODEL_REQUIRED'
    );
  }

  if (
    explicitAuthorization !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'EXPLICIT_AUTHORIZATION_REQUIRED'
    };
  }

  if (
    costClass !==
    'ZERO_VERIFIED'
  ) {
    return {
      allowed: false,
      reason:
        'ZERO_COST_ONLY'
    };
  }

  if (
    Number(maximumCostUsd) !==
    0
  ) {
    return {
      allowed: false,
      reason:
        'MAXIMUM_COST_MUST_BE_ZERO'
    };
  }

  if (
    priceEvidenceFresh !==
    true
  ) {
    return {
      allowed: false,
      reason:
        'PRICE_EVIDENCE_STALE_OR_MISSING'
    };
  }

  if (!priceEvidenceHash) {
    return {
      allowed: false,
      reason:
        'PRICE_EVIDENCE_HASH_REQUIRED'
    };
  }

  return {
    allowed: true,

    probe: {
      id:
        crypto.randomUUID(),

      provider:
        p,

      model:
        String(model),

      costClass:
        'ZERO_VERIFIED',

      maximumCostUsd:
        0,

      priceEvidenceHash,

      status:
        'AUTHORIZED_NOT_EXECUTED',

      createdAt:
        new Date()
          .toISOString()
    }
  };
}

module.exports = {
  PROVIDERS,
  normalizeProvider,
  create
};
