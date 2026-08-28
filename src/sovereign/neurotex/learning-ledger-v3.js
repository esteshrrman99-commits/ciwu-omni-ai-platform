'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function fingerprint(
  object
) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(
        object
      )
    )
    .digest('hex');
}

function promote({
  file,
  trial,
  fact,
  confidence
}) {
  if (
    trial
      ?.certification
      ?.certified !==
    true
  ) {
    return {
      promoted: false,
      reason:
        'TRIAL_NOT_CERTIFIED'
    };
  }

  const c =
    Number(
      confidence
    );

  if (
    !Number.isFinite(c) ||
    c < 0.8 ||
    c > 1
  ) {
    return {
      promoted: false,
      reason:
        'CONFIDENCE_GATE_FAILED'
    };
  }

  const record = {
    schema:
      'CIWU_NEUROTEX_LEARNING_V3',

    id:
      crypto.randomUUID(),

    createdAt:
      new Date()
        .toISOString(),

    trialHash:
      fingerprint(
        trial
      ),

    factHash:
      fingerprint(
        fact
      ),

    fact,

    confidence:
      c,

    status:
      'CERTIFIED_PROMOTION'
  };

  const target =
    path.resolve(
      file
    );

  fs.mkdirSync(
    path.dirname(
      target
    ),
    {
      recursive: true,
      mode: 0o700
    }
  );

  fs.appendFileSync(
    target,
    JSON.stringify(
      record
    ) + '\n',
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(
    target,
    0o600
  );

  return {
    promoted: true,
    record
  };
}

module.exports = {
  fingerprint,
  promote
};
