'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function chain(events) {
  let previous =
    'GENESIS';

  return events.map(event => {
    const serialized =
      JSON.stringify(event);

    const current =
      hash(
        previous +
        ':' +
        serialized
      );

    const record = {
      ...event,

      previousHash:
        previous,

      hash:
        current
    };

    previous =
      current;

    return record;
  });
}

function verify(records) {
  let previous =
    'GENESIS';

  for (
    const record of
    records
  ) {
    const {
      hash: claimed,
      previousHash,
      ...event
    } = record;

    if (
      previousHash !==
      previous
    ) {
      return false;
    }

    const calculated =
      hash(
        previous +
        ':' +
        JSON.stringify(event)
      );

    if (
      calculated !==
      claimed
    ) {
      return false;
    }

    previous =
      claimed;
  }

  return true;
}

module.exports = {
  chain,
  verify
};
