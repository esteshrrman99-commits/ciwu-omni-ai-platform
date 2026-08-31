'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function safeId(id) {
  if (
    typeof id !== 'string' ||
    !/^[A-Za-z0-9._-]+$/.test(id)
  ) {
    throw new Error(
      'TRANSACTION_ID_INVALID'
    );
  }

  return id;
}

function atomicWrite(file, value) {
  const dir =
    path.dirname(file);

  fs.mkdirSync(
    dir,
    {
      recursive: true,
      mode: 0o700
    }
  );

  const tmp =
    file +
    '.tmp-' +
    process.pid +
    '-' +
    crypto.randomBytes(6)
      .toString('hex');

  const fd =
    fs.openSync(
      tmp,
      'wx',
      0o600
    );

  try {
    fs.writeFileSync(
      fd,
      JSON.stringify(
        value,
        null,
        2
      ) + '\n',
      'utf8'
    );

    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  fs.renameSync(
    tmp,
    file
  );
}

class TransactionJournal {
  constructor(root) {
    this.root = root;

    fs.mkdirSync(
      root,
      {
        recursive: true,
        mode: 0o700
      }
    );
  }

  _file(id) {
    return path.join(
      this.root,
      safeId(id) + '.json'
    );
  }

  get(id) {
    const file =
      this._file(id);

    if (
      !fs.existsSync(file)
    ) {
      return null;
    }

    return JSON.parse(
      fs.readFileSync(
        file,
        'utf8'
      )
    );
  }

  put(id, value) {
    const current =
      this.get(id);

    const next = {
      version: 1,
      ticket_id: id,
      revision:
        current
          ? current.revision + 1
          : 1,
      ...value
    };

    atomicWrite(
      this._file(id),
      next
    );

    return next;
  }
}

module.exports = {
  TransactionJournal
};
