'use strict';

const crypto = require('node:crypto');

function create({
  provider,
  model,
  costClass,
  authorization
}) {
  if (!provider)
    throw new Error('PROVIDER_REQUIRED');

  if (!model)
    throw new Error('MODEL_REQUIRED');

  if (
    ![
      'ZERO_VERIFIED',
      'PAID',
      'UNKNOWN'
    ].includes(costClass)
  ) {
    throw new Error(
      'INVALID_COST_CLASS'
    );
  }

  const realInference =
    authorization
      ?.realInference === true;

  const paidInference =
    authorization
      ?.paidInference === true;

  if (!realInference) {
    return {
      allowed: false,
      reason:
        'REAL_INFERENCE_NOT_EXPLICITLY_AUTHORIZED'
    };
  }

  if (
    costClass === 'UNKNOWN'
  ) {
    return {
      allowed: false,
      reason:
        'UNKNOWN_COST'
    };
  }

  if (
    costClass === 'PAID' &&
    !paidInference
  ) {
    return {
      allowed: false,
      reason:
        'PAID_INFERENCE_NOT_AUTHORIZED'
    };
  }

  return {
    allowed: true,

    session: {
      id:
        crypto.randomUUID(),

      provider,
      model,
      costClass,

      createdAt:
        new Date()
          .toISOString(),

      status:
        'AUTHORIZED_NOT_EXECUTED',

      executed:
        false,

      certification:
        null
    }
  };
}

function complete(
  session,
  evidence
) {
  if (
    !session ||
    session.executed === true
  ) {
    throw new Error(
      'INVALID_CERTIFICATION_SESSION'
    );
  }

  if (
    !evidence ||
    evidence.realInference !==
      true
  ) {
    throw new Error(
      'REAL_INFERENCE_EVIDENCE_REQUIRED'
    );
  }

  return {
    ...session,

    executed:
      true,

    status:
      evidence.success === true
        ? 'CERTIFIED'
        : 'FAILED',

    certification: {
      success:
        evidence.success === true,

      latencyMs:
        Number(
          evidence.latencyMs
        ),

      costUsd:
        evidence.costUsd === null
          ? null
          : Number(
              evidence.costUsd
            ),

      responseHash:
        evidence.responseHash ||
        null,

      completedAt:
        new Date()
          .toISOString()
    }
  };
}

module.exports = {
  create,
  complete
};
