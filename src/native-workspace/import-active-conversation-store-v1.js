'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function safeId(value) {
  const text =
    String(value || '');

  if (
    !/^[A-Za-z0-9._:-]+$/.test(text)
  ) {
    return crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .slice(0, 32);
  }

  return text;
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

class ImportActiveConversationStore {
  constructor(root) {
    this.root = root;

    fs.mkdirSync(
      root,
      {
        recursive:true,
        mode:0o700
      }
    );
  }

  _file(
    sourceSha,
    conversationId
  ) {
    return path.join(
      this.root,
      sourceSha,
      safeId(
        conversationId
      ) + '.json'
    );
  }

  put(
    sourceSha,
    conversation
  ) {
    const file =
      this._file(
        sourceSha,
        conversation.external_id
      );

    if (
      fs.existsSync(file)
    ) {
      const existing =
        JSON.parse(
          fs.readFileSync(
            file,
            'utf8'
          )
        );

      return {
        created:false,
        record:existing
      };
    }

    const record = {
      version:1,
      namespace:
        'IMPORTED_ACTIVE',
      source_sha256:
        sourceSha,
      external_id:
        conversation.external_id,
      title:
        conversation.title,
      created_at:
        conversation.created_at,
      updated_at:
        conversation.updated_at,
      import_authority:
        'READ_IMPORT_ONLY',
      imported_content_inert:
        true,
      tool_execution_allowed:
        false,
      mutation_authority:
        false,
      messages:
        conversation.messages
    };

    atomicWrite(
      file,
      record
    );

    return {
      created:true,
      record
    };
  }

  _visibilityPaths(sourceSha) {
    const dir =
      path.join(
        this.root,
        sourceSha
      );

    return {
      dir,
      prepared:
        path.join(
          dir,
          '.visibility-prepared.json'
        ),
      committed:
        path.join(
          dir,
          '.visibility-committed.json'
        )
    };
  }

  _hashBytes(buffer) {
    return require('node:crypto')
      .createHash('sha256')
      .update(buffer)
      .digest('hex');
  }

  _activePayloadFiles(sourceSha) {
    const paths =
      this._visibilityPaths(sourceSha);

    if (
      !fs.existsSync(paths.dir) ||
      !fs.statSync(paths.dir)
        .isDirectory()
    ) {
      return [];
    }

    return fs.readdirSync(paths.dir)
      .filter(
        name =>
          name.endsWith('.json') &&
          name !== '.visibility-prepared.json' &&
          name !== '.visibility-committed.json'
      )
      .sort();
  }

  _buildVisibilityManifest(sourceSha) {
    if (
      !/^[a-f0-9]{64}$/i.test(
        String(sourceSha || '')
      )
    ) {
      throw new Error(
        'IMPORT_VISIBILITY_SOURCE_SHA_INVALID'
      );
    }

    const paths =
      this._visibilityPaths(sourceSha);

    const names =
      this._activePayloadFiles(sourceSha);

    const files =
      names.map(name => {
        const file =
          path.join(
            paths.dir,
            name
          );

        const bytes =
          fs.readFileSync(file);

        return {
          name,
          sha256:
            this._hashBytes(bytes),
          bytes:
            bytes.length
        };
      });

    const binding =
      this._hashBytes(
        Buffer.from(
          JSON.stringify({
            source_sha256:sourceSha,
            files
          })
        )
      );

    return {
      schema_version:1,
      state:'PREPARED',
      source_sha256:sourceSha,
      file_count:files.length,
      files,
      binding_sha256:binding,
      import_authority:
        'READ_IMPORT_ONLY',
      imported_content_inert:true,
      tool_execution_allowed:false,
      mutation_authority:false
    };
  }

  _manifestMatchesLive(
    sourceSha,
    manifest
  ) {
    try {
      if (
        !manifest ||
        manifest.schema_version !== 1 ||
        manifest.source_sha256 !== sourceSha ||
        !Array.isArray(manifest.files) ||
        !/^[a-f0-9]{64}$/i.test(
          String(
            manifest.binding_sha256 || ''
          )
        )
      ) {
        return false;
      }

      const live =
        this._buildVisibilityManifest(
          sourceSha
        );

      return (
        live.file_count ===
          manifest.file_count &&
        live.binding_sha256 ===
          manifest.binding_sha256 &&
        JSON.stringify(live.files) ===
          JSON.stringify(manifest.files)
      );
    } catch {
      return false;
    }
  }

  prepareVisibility(sourceSha) {
    const paths =
      this._visibilityPaths(sourceSha);

    const manifest =
      this._buildVisibilityManifest(
        sourceSha
      );

    fs.mkdirSync(
      paths.dir,
      {
        recursive:true
      }
    );

    atomicWrite(
      paths.prepared,
      manifest
    );

    return {
      ok:true,
      state:'PREPARED',
      source_sha256:sourceSha,
      binding_sha256:
        manifest.binding_sha256,
      file_count:
        manifest.file_count
    };
  }

  hasPreparedVisibility(sourceSha) {
    const paths =
      this._visibilityPaths(sourceSha);

    return fs.existsSync(
      paths.prepared
    );
  }

  commitPreparedVisibility(sourceSha) {
    const paths =
      this._visibilityPaths(sourceSha);

    if (
      !fs.existsSync(paths.prepared)
    ) {
      throw new Error(
        'IMPORT_VISIBILITY_PREPARED_MISSING'
      );
    }

    let manifest;

    try {
      manifest =
        JSON.parse(
          fs.readFileSync(
            paths.prepared,
            'utf8'
          )
        );
    } catch {
      throw new Error(
        'IMPORT_VISIBILITY_PREPARED_INVALID'
      );
    }

    if (
      !this._manifestMatchesLive(
        sourceSha,
        manifest
      )
    ) {
      throw new Error(
        'IMPORT_VISIBILITY_HASH_MISMATCH'
      );
    }

    const committed = {
      ...manifest,
      state:'COMMITTED'
    };

    /*
     * Rewrite the prepared artifact with its final
     * COMMITTED state before the atomic rename.
     */
    atomicWrite(
      paths.prepared,
      committed
    );

    fs.renameSync(
      paths.prepared,
      paths.committed
    );

    /*
     * Durability boundary:
     * fsync the containing directory after rename.
     */
    try {
      const fd =
        fs.openSync(
          paths.dir,
          'r'
        );

      try {
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
    } catch {
      /*
       * Platform directory-fsync support varies.
       * Visibility still requires the committed
       * marker and complete live hash validation.
       */
    }

    return {
      ok:true,
      state:'COMMITTED',
      source_sha256:sourceSha,
      binding_sha256:
        committed.binding_sha256,
      file_count:
        committed.file_count
    };
  }

  verifyVisibility(sourceSha) {
    const paths =
      this._visibilityPaths(sourceSha);

    if (
      !fs.existsSync(paths.committed)
    ) {
      return {
        visible:false,
        reason:
          'COMMITTED_VISIBILITY_MISSING'
      };
    }

    let manifest;

    try {
      manifest =
        JSON.parse(
          fs.readFileSync(
            paths.committed,
            'utf8'
          )
        );
    } catch {
      return {
        visible:false,
        reason:
          'COMMITTED_VISIBILITY_INVALID'
      };
    }

    if (
      manifest.state !== 'COMMITTED'
    ) {
      return {
        visible:false,
        reason:
          'VISIBILITY_NOT_COMMITTED'
      };
    }

    if (
      !this._manifestMatchesLive(
        sourceSha,
        manifest
      )
    ) {
      return {
        visible:false,
        reason:
          'VISIBILITY_HASH_MISMATCH'
      };
    }

    return {
      visible:true,
      source_sha256:sourceSha,
      binding_sha256:
        manifest.binding_sha256,
      file_count:
        manifest.file_count
    };
  }

  all() {
    const out = [];

    if (
      !fs.existsSync(this.root)
    ) {
      return out;
    }

    for (
      const sourceSha of
      fs.readdirSync(this.root)
        .sort()
    ) {
      const dir =
        path.join(
          this.root,
          sourceSha
        );

      if (
        !fs.statSync(dir)
          .isDirectory()
      ) {
        continue;
      }

      /*
       * Critical Leap017 visibility gate:
       * physical presence is never sufficient.
       */
      const visibility =
        this.verifyVisibility(
          sourceSha
        );

      if (!visibility.visible) {
        continue;
      }

      const names =
        this._activePayloadFiles(
          sourceSha
        );

      /*
       * Re-check the committed binding immediately
       * before materializing searchable records.
       */
      const secondCheck =
        this.verifyVisibility(
          sourceSha
        );

      if (!secondCheck.visible) {
        continue;
      }

      const batch = [];
      let valid = true;

      for (const name of names) {
        try {
          batch.push(
            JSON.parse(
              fs.readFileSync(
                path.join(
                  dir,
                  name
                ),
                'utf8'
              )
            )
          );
        } catch {
          valid = false;
          break;
        }
      }

      /*
       * Fail closed on any malformed record or
       * race/tamper detected after materialization.
       */
      if (
        !valid ||
        !this.verifyVisibility(
          sourceSha
        ).visible
      ) {
        continue;
      }

      out.push(...batch);
    }

    return out;
  }
}

module.exports = {
  ImportActiveConversationStore
};
