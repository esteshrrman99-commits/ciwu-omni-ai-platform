'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  canonicalize,
  sha256Canonical
} = require('./canonical-json-v1');

class AuditLedger {
  constructor(file) {
    this.file = file;

    fs.mkdirSync(
      path.dirname(file),
      { recursive: true }
    );

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '', {
        mode: 0o600
      });
    }
  }

  records() {
    const raw =
      fs.readFileSync(
        this.file,
        'utf8'
      );

    if (!raw.trim()) return [];

    return raw
      .trimEnd()
      .split('\n')
      .map((line, index) => {
        try {
          return JSON.parse(line);
        } catch (_) {
          throw new Error(
            `AUDIT_JSON_INVALID:${index + 1}`
          );
        }
      });
  }

  verify() {
    const rows = this.records();

    let previous = null;

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const row = rows[index];

      if (
        row.sequence !== index + 1
      ) {
        throw new Error(
          `AUDIT_SEQUENCE_INVALID:${index + 1}`
        );
      }

      if (
        row.previous_hash !== previous
      ) {
        throw new Error(
          `AUDIT_PREVIOUS_HASH_INVALID:${index + 1}`
        );
      }

      const {
        hash,
        ...unsigned
      } = row;

      const expected =
        sha256Canonical(unsigned);

      if (hash !== expected) {
        throw new Error(
          `AUDIT_HASH_INVALID:${index + 1}`
        );
      }

      previous = hash;
    }

    return {
      ok: true,
      count: rows.length,
      last_hash: previous
    };
  }

  hasTicket(ticketId) {
    this.verify();

    return this.records()
      .some(row =>
        row.ticket_id === ticketId
      );
  }

  append(record) {
    const verification =
      this.verify();

    const rows =
      this.records();

    const unsigned = {
      sequence: rows.length + 1,
      previous_hash:
        verification.last_hash,
      ...record
    };

    const row = {
      ...unsigned,
      hash:
        sha256Canonical(unsigned)
    };

    const fd = fs.openSync(
      this.file,
      'a',
      0o600
    );

    try {
      fs.writeSync(
        fd,
        canonicalize(row) + '\n',
        null,
        'utf8'
      );

      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }

    this.verify();

    return { ...row };
  }
}

module.exports = {
  AuditLedger
};
