'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto =
  require('node:crypto');

function safeSha(value) {
  if (
    typeof value !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value)
  ) {
    throw new Error(
      'IMPORT_SOURCE_SHA_INVALID'
    );
  }

  return value;
}

function atomicWrite(
  file,
  value
) {
  const dir =
    path.dirname(file);

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

class ImportProvenanceStore {
  constructor(root) {
    this.root = root;

    this.sourcesRoot =
      path.join(
        root,
        'sources'
      );

    fs.mkdirSync(
      this.sourcesRoot,
      {
        recursive:true,
        mode:0o700
      }
    );
  }

  _file(sourceSha) {
    return path.join(
      this.sourcesRoot,
      safeSha(sourceSha) +
      '.json'
    );
  }

  has(sourceSha) {
    return fs.existsSync(
      this._file(sourceSha)
    );
  }

  get(sourceSha) {
    const file =
      this._file(sourceSha);

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

  create(record) {
    const sourceSha =
      safeSha(
        record.source_sha256
      );

    const file =
      this._file(sourceSha);

    if (
      fs.existsSync(file)
    ) {
      return {
        created:false,
        record:
          this.get(sourceSha)
      };
    }

    const immutable = {
      version:1,
      import_id:
        'imp_' +
        sourceSha.slice(0, 24),
      source_sha256:
        sourceSha,
      source_name:
        record.source_name,
      source_format:
        record.source_format,
      conversation_count:
        record.conversation_count,
      message_count:
        record.message_count,
      imported_at:
        record.imported_at,
      import_authority:
        'READ_IMPORT_ONLY',
      imported_content_inert:
        true,
      tool_execution_allowed:
        false,
      mutation_authority:
        false,
      conversations:
        record.conversations
    };

    atomicWrite(
      file,
      immutable
    );

    return {
      created:true,
      record:immutable
    };
  }
}

module.exports = {
  ImportProvenanceStore
};
