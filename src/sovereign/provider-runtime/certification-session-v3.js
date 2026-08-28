'use strict';

const crypto = require('node:crypto');

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(String(value ?? ''))
    .digest('hex');
}

function create({
  provider,
  model,
  costClass,
  priceEvidenceHash,
  maximumCostUsd = 0
}) {
  if (!provider)
    throw new Error('PROVIDER_REQUIRED');

  if (!model)
    throw new Error('MODEL_REQUIRED');

  if (!priceEvidenceHash)
    throw new Error('PRICE_EVIDENCE_REQUIRED');

  if (costClass !== 'ZERO_VERIFIED') {
    throw new Error(
      'ZERO_COST_SESSION_ONLY'
    );
  }

  if (Number(maximumCostUsd) !== 0) {
    throw new Error(
      'SESSION_MAXIMUM_COST_MUST_BE_ZERO'
    );
  }

  const nonce =
    crypto.randomBytes(32)
      .toString('hex');

  const base = {
    schema:
      'CIWU_CERTIFICATION_SESSION_V3',

    sessionId:
      crypto.randomUUID(),

    provider,
    model,
    costClass,
    maximumCostUsd: 0,
    priceEvidenceHash,
    nonceHash:
      sha(nonce),

    state:
      'AUTHORIZED_NOT_EXECUTED',

    createdAt:
      new Date().toISOString()
  };

  return {
    session: base,
    nonce
  };
}

function verifyNonce(
  session,
  nonce
) {
  return (
    session?.nonceHash ===
    sha(nonce)
  );
}

module.exports = {
  sha,
  create,
  verifyNonce
};
