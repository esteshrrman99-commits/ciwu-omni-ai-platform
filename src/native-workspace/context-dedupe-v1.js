'use strict';

const crypto =
  require('node:crypto');

function hashText(value) {
  return crypto
    .createHash('sha256')
    .update(
      String(value || '')
        .trim()
        .replace(/\s+/g,' ')
        .toLowerCase()
    )
    .digest('hex');
}

function dedupeContext(
  rows
) {
  const seen =
    new Set();

  const out = [];

  for (
    const row of
    rows
  ) {
    const key =
      hashText(
        row.content
      );

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    out.push({
      ...row,
      content_sha256:key
    });
  }

  return out;
}

module.exports = {
  hashText,
  dedupeContext
};
