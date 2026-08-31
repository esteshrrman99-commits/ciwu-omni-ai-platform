'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const CONTEXT_CLASS =
  'NON_AUTHORITATIVE_CONTEXT';

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function canonical(value) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return (
      '[' +
      value.map(canonical).join(',') +
      ']'
    );
  }

  return (
    '{' +
    Object.keys(value)
      .sort()
      .map(
        key =>
          JSON.stringify(key) +
          ':' +
          canonical(value[key])
      )
      .join(',') +
    '}'
  );
}

function clone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

function authorityIsZero(input) {
  const authority =
    input.authority || {};

  const prohibited = [
    'operational',
    'tool',
    'write',
    'execute',
    'commit',
    'push',
    'deploy',
    'network'
  ];

  return prohibited.every(key => {
    const value = authority[key];

    return (
      value === undefined ||
      value === false ||
      value === 0 ||
      value === '0' ||
      value === 'BLOCKED' ||
      value === 'NONE'
    );
  });
}

class ProviderContextPersistence {
  constructor({
    stateRoot,
    clock = () =>
      new Date().toISOString()
  }) {
    if (!stateRoot) {
      throw new Error(
        'STATE_ROOT_REQUIRED'
      );
    }

    this.clock = clock;

    this.root =
      path.join(
        stateRoot,
        'provider-context'
      );

    this.ledger =
      path.join(
        this.root,
        'provider-context-ledger.jsonl'
      );

    fs.mkdirSync(
      this.root,
      {
        recursive:true
      }
    );
  }

  _readRaw() {
    if (!fs.existsSync(this.ledger)) {
      return [];
    }

    const text =
      fs.readFileSync(
        this.ledger,
        'utf8'
      );

    if (!text.trim()) {
      return [];
    }

    return text
      .trimEnd()
      .split('\n')
      .map(line => JSON.parse(line));
  }

  verifyLedger() {
    let rows;

    try {
      rows = this._readRaw();
    } catch (_) {
      return {
        ok:false,
        code:'LEDGER_PARSE_FAILURE'
      };
    }

    let previousHash = 'GENESIS';

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const row = rows[index];

      if (
        row.previousHash !==
        previousHash
      ) {
        return {
          ok:false,
          code:
            'PREVIOUS_HASH_MISMATCH',
          index
        };
      }

      const expected =
        sha256(
          canonical({
            previousHash:
              row.previousHash,
            body:
              row.body
          })
        );

      if (
        expected !==
        row.recordHash
      ) {
        return {
          ok:false,
          code:
            'RECORD_HASH_MISMATCH',
          index
        };
      }

      previousHash =
        row.recordHash;
    }

    return {
      ok:true,
      records:rows.length,
      head:
        rows.length
          ? rows[
              rows.length - 1
            ].recordHash
          : 'GENESIS'
    };
  }

  persist(input) {
    if (
      !input ||
      typeof input !== 'object'
    ) {
      throw new Error(
        'CONTEXT_INPUT_REQUIRED'
      );
    }

    if (
      input.contextClass !==
      CONTEXT_CLASS
    ) {
      throw new Error(
        'UNAUTHORIZED_CONTEXT_CLASS'
      );
    }

    if (
      typeof input.content !==
      'string'
    ) {
      throw new Error(
        'CONTENT_STRING_REQUIRED'
      );
    }

    if (
      !input.provenance ||
      typeof input.provenance !==
        'object'
    ) {
      throw new Error(
        'PROVENANCE_REQUIRED'
      );
    }

    if (!authorityIsZero(input)) {
      throw new Error(
        'PROVIDER_CONTEXT_AUTHORITY_FORBIDDEN'
      );
    }

    const computedContentHash =
      sha256(input.content);

    if (
      input.contentHash &&
      input.contentHash !==
        computedContentHash
    ) {
      throw new Error(
        'CONTENT_HASH_MISMATCH'
      );
    }

    const verified =
      this.verifyLedger();

    if (!verified.ok) {
      throw new Error(
        'LEDGER_INTEGRITY_FAILURE'
      );
    }

    const body = {
      schema:
        'ciwu.provider-context.persistence.v1',

      observedAt:
        input.observedAt ||
        this.clock(),

      providerId:
        String(
          input.providerId ||
          'UNKNOWN_PROVIDER'
        ),

      modelId:
        String(
          input.modelId ||
          'UNKNOWN_MODEL'
        ),

      responseId:
        String(
          input.responseId ||
          ''
        ),

      contextClass:
        CONTEXT_CLASS,

      authoritativeForIntent:false,

      providerContentIsInstruction:false,

      content:
        input.content,

      contentHash:
        computedContentHash,

      provenance:
        clone(input.provenance),

      authority:{
        operational:false,
        tool:false,
        write:false,
        execute:false,
        commit:false,
        push:false,
        deploy:false,
        network:false
      }
    };

    const previousHash =
      verified.head;

    const recordHash =
      sha256(
        canonical({
          previousHash,
          body
        })
      );

    const record = {
      previousHash,
      recordHash,
      body
    };

    const current =
      fs.existsSync(this.ledger)
        ? fs.readFileSync(
            this.ledger,
            'utf8'
          )
        : '';

    const temp =
      this.ledger +
      '.tmp-' +
      process.pid +
      '-' +
      Date.now();

    fs.writeFileSync(
      temp,
      current +
        JSON.stringify(record) +
        '\n',
      {
        encoding:'utf8',
        mode:0o600
      }
    );

    fs.renameSync(
      temp,
      this.ledger
    );

    return clone(record);
  }

  retrieve({
    providerId,
    modelId,
    limit = 20
  } = {}) {
    const verified =
      this.verifyLedger();

    if (!verified.ok) {
      throw new Error(
        'LEDGER_INTEGRITY_FAILURE'
      );
    }

    const bounded =
      Math.max(
        1,
        Math.min(
          Number(limit) || 20,
          100
        )
      );

    let rows =
      this._readRaw();

    if (providerId) {
      rows =
        rows.filter(
          row =>
            row.body.providerId ===
            providerId
        );
    }

    if (modelId) {
      rows =
        rows.filter(
          row =>
            row.body.modelId ===
            modelId
        );
    }

    return rows
      .slice(-bounded)
      .reverse()
      .map(clone);
  }
}

module.exports = {
  CONTEXT_CLASS,
  ProviderContextPersistence,
  sha256,
  canonical,
  authorityIsZero
};
