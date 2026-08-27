'use strict';

const crypto = require('node:crypto');

class MemoryStore {
  constructor() {
    this.records = new Map();
  }

  add({
    content,
    provenance,
    confidence = 0,
    tags = []
  }) {
    if (!content)
      throw new TypeError('CONTENT_REQUIRED');

    if (!provenance)
      throw new TypeError('PROVENANCE_REQUIRED');

    const id = crypto.randomUUID();

    const record = {
      id,
      content,
      provenance,
      confidence,
      tags: [...tags],
      createdAt: new Date().toISOString()
    };

    this.records.set(id, record);
    return record;
  }

  get(id) {
    return this.records.get(id) || null;
  }

  search(term) {
    const q = String(term || '').toLowerCase();

    return [...this.records.values()]
      .filter(r =>
        r.content.toLowerCase().includes(q) ||
        r.tags.some(t => String(t).toLowerCase().includes(q))
      );
  }
}

module.exports = {
  MemoryStore
};
