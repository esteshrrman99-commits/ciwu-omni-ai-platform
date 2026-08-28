'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  provider,
  model,
  costClass,
  source,
  verifiedAt,
  expiresAt
}) {
  if (!provider)
    throw new Error(
      'PROVIDER_REQUIRED'
    );

  if (!model)
    throw new Error(
      'MODEL_REQUIRED'
    );

  if (!source)
    throw new Error(
      'SOURCE_REQUIRED'
    );

  const verified =
    Date.parse(verifiedAt);

  const expires =
    Date.parse(expiresAt);

  if (
    !Number.isFinite(verified) ||
    !Number.isFinite(expires)
  ) {
    throw new Error(
      'PRICE_DATE_INVALID'
    );
  }

  if (expires <= verified) {
    throw new Error(
      'PRICE_EXPIRY_INVALID'
    );
  }

  const base = {
    schema:
      'CIWU_PRICE_EVIDENCE_V3',

    provider,
    model,
    costClass:
      costClass ||
      'UNKNOWN',

    source,
    verifiedAt:
      new Date(verified)
        .toISOString(),

    expiresAt:
      new Date(expires)
        .toISOString()
  };

  return {
    ...base,
    evidenceHash:
      hash(base)
  };
}

function evaluate(
  record,
  now = Date.now()
) {
  if (!record) {
    return {
      fresh: false,
      reason:
        'PRICE_EVIDENCE_MISSING'
    };
  }

  if (
    hash({
      schema:
        record.schema,
      provider:
        record.provider,
      model:
        record.model,
      costClass:
        record.costClass,
      source:
        record.source,
      verifiedAt:
        record.verifiedAt,
      expiresAt:
        record.expiresAt
    }) !==
    record.evidenceHash
  ) {
    return {
      fresh: false,
      reason:
        'PRICE_EVIDENCE_HASH_MISMATCH'
    };
  }

  if (
    Date.parse(
      record.expiresAt
    ) <= now
  ) {
    return {
      fresh: false,
      reason:
        'PRICE_EVIDENCE_STALE'
    };
  }

  return {
    fresh: true,
    reason:
      'PRICE_EVIDENCE_FRESH'
  };
}

module.exports = {
  hash,
  create,
  evaluate
};
