'use strict';

const crypto =
  require('node:crypto');

function create({
  taskId,
  provider,
  model,
  routingScore,
  evidenceHash,
  decision,
  safety,
  authorization
}) {
  if (!taskId)
    throw new Error(
      'TASK_ID_REQUIRED'
    );

  if (!evidenceHash)
    throw new Error(
      'EVIDENCE_HASH_REQUIRED'
    );

  const base = {
    schema:
      'CIWU_LIVE_DECISION_ENVELOPE_V1',

    taskId,
    provider,
    model,

    routingScore:
      Number(
        routingScore || 0
      ),

    evidenceHash,

    decision:
      decision ||
      'ABSTAIN',

    safety: {
      productionMutation:
        safety
          ?.productionMutation ===
        true,

      autonomousPush:
        safety
          ?.autonomousPush ===
        true,

      autonomousPurchase:
        safety
          ?.autonomousPurchase ===
        true
    },

    authorization: {
      realInference:
        authorization
          ?.realInference ===
        true,

      paidInference:
        authorization
          ?.paidInference ===
        true
    },

    createdAt:
      new Date()
        .toISOString()
  };

  const envelopeHash =
    crypto
      .createHash('sha256')
      .update(
        JSON.stringify(base)
      )
      .digest('hex');

  return {
    ...base,
    envelopeHash
  };
}

function safe(record) {
  return (
    record
      ?.safety
      ?.productionMutation !==
      true &&
    record
      ?.safety
      ?.autonomousPush !==
      true &&
    record
      ?.safety
      ?.autonomousPurchase !==
      true
  );
}

module.exports = {
  create,
  safe
};
