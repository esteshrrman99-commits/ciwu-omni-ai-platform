'use strict';

const fs =
  require('node:fs');

const path =
  require('node:path');

const crypto =
  require('node:crypto');

class PersistentMemory {
  constructor(file) {
    this.file =
      path.resolve(file);

    fs.mkdirSync(
      path.dirname(
        this.file
      ),
      { recursive: true }
    );

    if (
      !fs.existsSync(
        this.file
      )
    ) {
      fs.writeFileSync(
        this.file,
        '',
        { mode: 0o600 }
      );
    }

    try {
      fs.chmodSync(
        this.file,
        0o600
      );
    } catch {}
  }

  append({
    type,
    content,
    provenance,
    confidence,
    tags = []
  }) {
    if (!type)
      throw new Error(
        'TYPE_REQUIRED'
      );

    if (!content)
      throw new Error(
        'CONTENT_REQUIRED'
      );

    if (!provenance)
      throw new Error(
        'PROVENANCE_REQUIRED'
      );

    if (
      !Number.isFinite(
        confidence
      ) ||
      confidence < 0 ||
      confidence > 1
    ) {
      throw new Error(
        'CONFIDENCE_REQUIRED'
      );
    }

    const record = {
      id:
        crypto.randomUUID(),

      type,
      content,
      provenance,
      confidence,

      tags:
        Array.isArray(tags)
          ? [...tags]
          : [],

      timestamp:
        new Date()
          .toISOString()
    };

    fs.appendFileSync(
      this.file,
      JSON.stringify(record) +
      '\n',
      { mode: 0o600 }
    );

    return record;
  }

  records() {
    return fs
      .readFileSync(
        this.file,
        'utf8'
      )
      .split('\n')
      .filter(Boolean)
      .map(
        line =>
          JSON.parse(line)
      );
  }

  search(query) {
    const q =
      String(query || '')
        .toLowerCase();

    return this.records()
      .filter(record =>
        String(
          record.content
        )
          .toLowerCase()
          .includes(q) ||

        record.tags.some(
          tag =>
            String(tag)
              .toLowerCase()
              .includes(q)
        )
      );
  }
}

module.exports = {
  PersistentMemory
};
