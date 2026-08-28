'use strict';

const crypto =
  require('node:crypto');

function create({
  provider,
  model,
  authorization,
  costClass,
  expiresAt
}) {
  if (!provider)
    throw new Error('PROVIDER_REQUIRED');

  if (!model)
    throw new Error('MODEL_REQUIRED');

  if (
    authorization !==
    'EXPLICITLY_AUTHORIZED'
  ) {
    throw new Error(
      'EXPLICIT_AUTHORIZATION_REQUIRED'
    );
  }

  if (
    costClass !== 'ZERO_VERIFIED'
  ) {
    throw new Error(
      'ZERO_VERIFIED_COST_REQUIRED'
    );
  }

  const expires =
    new Date(expiresAt).getTime();

  if (
    !Number.isFinite(expires) ||
    expires <= Date.now()
  ) {
    throw new Error(
      'INVALID_CERTIFICATION_EXPIRY'
    );
  }

  return {
    schema:
      'CIWU_CERTIFICATION_CEREMONY_V2',

    ceremonyId:
      crypto.randomUUID(),

    nonce:
      crypto.randomBytes(24)
        .toString('hex'),

    provider,
    model,

    authorization,
    costClass,

    expiresAt:
      new Date(expires)
        .toISOString(),

    consumed:
      false
  };
}

function consume(ceremony) {
  if (!ceremony)
    throw new Error(
      'CEREMONY_REQUIRED'
    );

  if (ceremony.consumed)
    throw new Error(
      'CEREMONY_ALREADY_CONSUMED'
    );

  if (
    Date.now() >=
    new Date(
      ceremony.expiresAt
    ).getTime()
  ) {
    throw new Error(
      'CEREMONY_EXPIRED'
    );
  }

  ceremony.consumed = true;

  return {
    ...ceremony
  };
}

module.exports = {
  create,
  consume
};
