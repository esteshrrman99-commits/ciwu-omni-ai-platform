'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function create({
  taskClass,
  provider,
  model,
  eonsScore,
  evidenceHash,
  budgetStateHash,
  fallbackRank,
  authorizationState,
  selected
}) {
  if (!taskClass) {
    throw new Error(
      'TASK_CLASS_REQUIRED'
    );
  }

  const base = {
    schema:
      'CIWU_RUNTIME_DECISION_V2',

    decisionId:
      crypto.randomUUID(),

    taskClass,

    selected:
      selected === true,

    provider:
      selected === true
        ? provider
        : null,

    model:
      selected === true
        ? model
        : null,

    eonsScore:
      selected === true
        ? Number(eonsScore)
        : null,

    evidenceHash:
      evidenceHash || null,

    budgetStateHash:
      budgetStateHash || null,

    fallbackRank:
      selected === true
        ? Number(fallbackRank)
        : null,

    authorizationState:
      authorizationState ||
      'UNKNOWN',

    createdAt:
      new Date().toISOString()
  };

  return {
    ...base,
    decisionHash:
      hash(base)
  };
}

function verify(record) {
  if (!record?.decisionHash) {
    return false;
  }

  const copy = {
    ...record
  };

  delete copy.decisionHash;

  return (
    hash(copy) ===
    record.decisionHash
  );
}

module.exports = {
  hash,
  create,
  verify
};
