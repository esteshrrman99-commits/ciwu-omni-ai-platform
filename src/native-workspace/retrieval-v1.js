'use strict';

function tokens(value) {
  return new Set(
    String(value || '')
      .toLowerCase()
      .split(/[^a-z0-9_]+/)
      .filter(Boolean)
  );
}

function overlap(query, content) {
  const q = tokens(query);
  const c = tokens(content);

  if (q.size === 0) return 0;

  let matches = 0;

  for (const token of q) {
    if (c.has(token)) matches += 1;
  }

  return matches / q.size;
}

function retrieve(records, query, limit = 5) {
  if (!Array.isArray(records)) {
    throw new Error('INVALID_RECORDS');
  }

  return records
    .map(record => ({
      record,
      lexical_score: overlap(query, record.content)
    }))
    .filter(item => item.lexical_score > 0)
    .sort((a, b) => {
      if (b.lexical_score !== a.lexical_score) {
        return b.lexical_score - a.lexical_score;
      }

      const bc = Number(b.record.confidence || 0);
      const ac = Number(a.record.confidence || 0);

      if (bc !== ac) return bc - ac;

      return String(a.record.id)
        .localeCompare(String(b.record.id));
    })
    .slice(0, limit);
}

module.exports = {
  tokens,
  overlap,
  retrieve
};
