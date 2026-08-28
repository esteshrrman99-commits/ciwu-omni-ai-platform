'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function append(file, event) {
  const amount =
    Number(
      event.amountUsd
    );

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      'INVALID_AMOUNT'
    );
  }

  const record = {
    id:
      crypto.randomUUID(),

    timestamp:
      new Date()
        .toISOString(),

    provider:
      event.provider || null,

    model:
      event.model || null,

    type:
      event.type || 'INFERENCE',

    amountUsd:
      amount,

    source:
      event.source || 'UNKNOWN'
  };

  const target =
    path.resolve(file);

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
      mode: 0o700
    }
  );

  fs.appendFileSync(
    target,
    JSON.stringify(record) +
    '\n',
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(
    target,
    0o600
  );

  return record;
}

function records(file) {
  if (!fs.existsSync(file))
    return [];

  return fs
    .readFileSync(
      file,
      'utf8'
    )
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
}

function monthTotal(
  file,
  {
    year,
    month
  }
) {
  const prefix =
    `${year}-${String(month)
      .padStart(2,'0')}`;

  return records(file)
    .filter(
      x =>
        String(
          x.timestamp
        ).startsWith(prefix)
    )
    .reduce(
      (sum,x) =>
        sum +
        Number(
          x.amountUsd || 0
        ),
      0
    );
}

function remaining({
  spentUsd,
  capUsd = 100
}) {
  const spent =
    Number(spentUsd);

  const cap =
    Number(capUsd);

  if (
    !Number.isFinite(spent) ||
    !Number.isFinite(cap)
  ) {
    throw new Error(
      'INVALID_BUDGET_VALUE'
    );
  }

  return Math.max(
    0,
    cap - spent
  );
}

module.exports = {
  append,
  records,
  monthTotal,
  remaining
};
