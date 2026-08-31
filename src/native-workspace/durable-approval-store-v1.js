'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function atomicWrite(file, value) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, {
    recursive: true,
    mode: 0o700
  });

  const tmp =
    file +
    '.tmp-' +
    process.pid +
    '-' +
    crypto.randomBytes(6).toString('hex');

  const data =
    JSON.stringify(value, null, 2) + '\n';

  const fd =
    fs.openSync(
      tmp,
      'wx',
      0o600
    );

  try {
    fs.writeFileSync(
      fd,
      data,
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

  try {
    const dfd =
      fs.openSync(
        dir,
        'r'
      );

    try {
      fs.fsyncSync(dfd);
    } finally {
      fs.closeSync(dfd);
    }
  } catch (_) {
    // Some Android/Termux filesystems
    // do not permit directory fsync.
  }
}

class DurableApprovalStore {
  constructor(file) {
    if (!file) {
      throw new Error(
        'APPROVAL_STORE_FILE_REQUIRED'
      );
    }

    this.file = file;

    if (!fs.existsSync(file)) {
      atomicWrite(
        file,
        {
          version: 1,
          revision: 0,
          tickets: []
        }
      );
    }

    this._load();
  }

  _load() {
    const raw =
      JSON.parse(
        fs.readFileSync(
          this.file,
          'utf8'
        )
      );

    if (
      !raw ||
      raw.version !== 1 ||
      !Number.isInteger(
        raw.revision
      ) ||
      !Array.isArray(
        raw.tickets
      )
    ) {
      throw new Error(
        'APPROVAL_STORE_INVALID'
      );
    }

    this.state = raw;
    return raw;
  }

  _save() {
    this.state.revision += 1;

    atomicWrite(
      this.file,
      this.state
    );
  }

  get(id) {
    this._load();

    const ticket =
      this.state.tickets.find(
        row => row.id === id
      );

    return ticket
      ? clone(ticket)
      : null;
  }

  all() {
    this._load();
    return clone(
      this.state
    );
  }

  create(
    request,
    timestamp
  ) {
    this._load();

    if (
      !request ||
      typeof request.action !==
        'string'
    ) {
      throw new Error(
        'APPROVAL_ACTION_REQUIRED'
      );
    }

    const ticket = {
      id:
        crypto.randomUUID(),
      action:
        request.action,
      payload:
        clone(
          request.payload || {}
        ),
      status:
        'PENDING',
      execution_status:
        'NOT_EXECUTED',
      created_at:
        timestamp,
      decided_at:
        null
    };

    this.state.tickets.push(
      ticket
    );

    this._save();

    return clone(ticket);
  }

  decide(
    id,
    decision,
    timestamp
  ) {
    this._load();

    if (
      ![
        'APPROVED',
        'DENIED'
      ].includes(decision)
    ) {
      throw new Error(
        'APPROVAL_DECISION_INVALID'
      );
    }

    const ticket =
      this.state.tickets.find(
        row => row.id === id
      );

    if (!ticket) {
      throw new Error(
        'APPROVAL_TICKET_NOT_FOUND'
      );
    }

    if (
      ticket.status !==
      'PENDING'
    ) {
      if (
        ticket.status ===
        decision
      ) {
        return clone(ticket);
      }

      throw new Error(
        'APPROVAL_ALREADY_DECIDED'
      );
    }

    ticket.status =
      decision;

    ticket.decided_at =
      timestamp;

    this._save();

    return clone(ticket);
  }
}

module.exports = {
  DurableApprovalStore
};
