'use strict';

const crypto = require('node:crypto');

function create({
  action,
  inputs,
  gates,
  decision
}) {
  const record = {
    schema:
      'CIWU_DECISION_TRACE_V1',

    id:
      crypto.randomUUID(),

    createdAt:
      new Date()
        .toISOString(),

    action:
      action || 'UNKNOWN',

    inputs:
      inputs || {},

    gates:
      gates || {},

    decision:
      decision || 'ABSTAIN'
  };

  record.hash =
    crypto
      .createHash('sha256')
      .update(
        JSON.stringify(
          record
        )
      )
      .digest('hex');

  return record;
}

function valid(
  record
) {
  const copy = {
    ...record
  };

  const expected =
    copy.hash;

  delete copy.hash;

  const actual =
    crypto
      .createHash('sha256')
      .update(
        JSON.stringify(
          copy
        )
      )
      .digest('hex');

  return (
    expected ===
    actual
  );
}

module.exports = {
  create,
  valid
};
