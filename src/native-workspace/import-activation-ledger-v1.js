'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function validSha(value) {
  if (
    typeof value !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value)
  ) {
    throw new Error(
      'ACTIVATION_SOURCE_SHA_INVALID'
    );
  }

  return value;
}

function atomicWrite(file, value) {
  const dir = path.dirname(file);

  fs.mkdirSync(
    dir,
    {
      recursive:true,
      mode:0o700
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

class ImportActivationLedger {
  constructor(file) {
    this.file = file;

    if (!fs.existsSync(file)) {
      atomicWrite(
        file,
        {
          version:1,
          revision:0,
          activations:[]
        }
      );
    }

    this._load();
  }

  _load() {
    const state =
      JSON.parse(
        fs.readFileSync(
          this.file,
          'utf8'
        )
      );

    if (
      !state ||
      state.version !== 1 ||
      !Number.isInteger(
        state.revision
      ) ||
      !Array.isArray(
        state.activations
      )
    ) {
      throw new Error(
        'ACTIVATION_LEDGER_INVALID'
      );
    }

    this.state = state;
    return state;
  }

  _save() {
    this.state.revision += 1;
    atomicWrite(
      this.file,
      this.state
    );
  }

  get(sourceSha) {
    validSha(sourceSha);
    this._load();

    return (
      this.state.activations.find(
        row =>
          row.source_sha256 ===
          sourceSha
      ) || null
    );
  }

  record(record) {
    validSha(
      record.source_sha256
    );

    this._load();

    const existing =
      this.state.activations.find(
        row =>
          row.source_sha256 ===
          record.source_sha256
      );

    if (existing) {
      return {
        created:false,
        record:existing
      };
    }

    this.state.activations.push(
      record
    );

    this._save();

    return {
      created:true,
      record
    };
  }
}

module.exports = {
  ImportActivationLedger
};
