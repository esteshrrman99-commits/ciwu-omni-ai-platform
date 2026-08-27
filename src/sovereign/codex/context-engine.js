'use strict';

const fs = require('node:fs');
const path = require('node:path');

const EXCLUDED = new Set([
  '.git',
  'node_modules',
  '.ciwu-private',
  'coverage',
  'dist',
  'build'
]);

const TEXT_EXT = new Set([
  '.js','.cjs','.mjs',
  '.ts','.tsx','.jsx',
  '.json','.md','.py',
  '.sh','.html','.css'
]);

function walk(
  root,
  current = root,
  out = []
) {
  for (
    const entry of fs.readdirSync(
      current,
      { withFileTypes: true }
    )
  ) {
    if (EXCLUDED.has(entry.name))
      continue;

    const full =
      path.join(
        current,
        entry.name
      );

    if (entry.isSymbolicLink())
      continue;

    if (entry.isDirectory()) {
      walk(root, full, out);
      continue;
    }

    out.push({
      full,
      relative:
        path.relative(
          root,
          full
        )
    });
  }

  return out;
}

function tokenize(query) {
  return String(query || '')
    .toLowerCase()
    .split(/[^a-z0-9_$.-]+/)
    .filter(Boolean);
}

function relevance(
  text,
  query
) {
  const hay =
    String(text)
      .toLowerCase();

  const terms =
    tokenize(query);

  if (!terms.length)
    return 0;

  return terms.reduce(
    (score, term) =>
      score +
      (
        hay.includes(term)
          ? 1
          : 0
      ),
    0
  ) / terms.length;
}

function retrieve(
  root,
  query,
  {
    topK = 8,
    maxBytesPerFile = 100000
  } = {}
) {
  root =
    path.resolve(root);

  return walk(root)
    .filter(item =>
      TEXT_EXT.has(
        path.extname(
          item.relative
        )
      )
    )
    .map(item => {
      const stat =
        fs.statSync(item.full);

      if (
        stat.size >
        maxBytesPerFile
      ) return null;

      const text =
        fs.readFileSync(
          item.full,
          'utf8'
        );

      return {
        path:
          item.relative,

        score:
          relevance(
            item.relative +
            '\n' +
            text,
            query
          ),

        excerpt:
          text.slice(
            0,
            12000
          )
      };
    })
    .filter(Boolean)
    .filter(x => x.score > 0)
    .sort(
      (a,b) =>
        b.score - a.score
    )
    .slice(0, topK);
}

module.exports = {
  walk,
  tokenize,
  relevance,
  retrieve
};
