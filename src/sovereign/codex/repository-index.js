'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const EXCLUDED = new Set([
  '.git',
  'node_modules',
  '.ciwu-private',
  'dist',
  'build',
  'coverage'
]);

const CODE_EXTENSIONS =
  new Set([
    '.js',
    '.cjs',
    '.mjs',
    '.ts',
    '.tsx',
    '.jsx',
    '.json',
    '.py',
    '.sh'
  ]);

function hash(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

function walk(root, current = root, output = []) {
  for (
    const entry of
    fs.readdirSync(
      current,
      { withFileTypes: true }
    )
  ) {
    if (EXCLUDED.has(entry.name))
      continue;

    const absolute =
      path.join(current, entry.name);

    if (entry.isSymbolicLink())
      continue;

    if (entry.isDirectory()) {
      walk(root, absolute, output);
      continue;
    }

    const relative =
      path.relative(root, absolute);

    output.push({
      absolute,
      relative
    });
  }

  return output;
}

function symbols(text) {
  const result = [];

  const patterns = [
    {
      type: 'function',
      regex:
        /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g
    },
    {
      type: 'class',
      regex:
        /\bclass\s+([A-Za-z_$][\w$]*)/g
    },
    {
      type: 'const-function',
      regex:
        /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g
    }
  ];

  for (const pattern of patterns) {
    let match;

    while (
      (match =
        pattern.regex.exec(text))
    ) {
      result.push({
        type: pattern.type,
        name: match[1]
      });
    }
  }

  return result;
}

function imports(text) {
  const found = new Set();

  const patterns = [
    /require\(['"]([^'"]+)['"]\)/g,
    /from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g
  ];

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(text)))
      found.add(match[1]);
  }

  return [...found];
}

function buildRepositoryIndex(root) {
  root = path.resolve(root);

  const files = [];

  for (const item of walk(root)) {
    const ext =
      path.extname(item.relative);

    const stat =
      fs.statSync(item.absolute);

    const record = {
      path: item.relative,
      bytes: stat.size,
      extension: ext,
      test:
        /(^|\/)(test|tests)\//i
          .test(item.relative) ||
        /\.(test|spec)\./i
          .test(item.relative)
    };

    if (
      CODE_EXTENSIONS.has(ext) &&
      stat.size <= 1024 * 1024
    ) {
      const text =
        fs.readFileSync(
          item.absolute,
          'utf8'
        );

      record.sha256 =
        hash(text);

      if (
        ['.js','.cjs','.mjs','.ts','.tsx','.jsx']
          .includes(ext)
      ) {
        record.symbols =
          symbols(text);

        record.imports =
          imports(text);
      }
    }

    files.push(record);
  }

  const symbolCount =
    files.reduce(
      (n, f) =>
        n +
        (f.symbols?.length || 0),
      0
    );

  return {
    schema:
      'CIWU_CODEX_REPOSITORY_INDEX_V1',

    generatedAt:
      new Date().toISOString(),

    root:
      path.basename(root),

    fileCount:
      files.length,

    symbolCount,

    testFileCount:
      files.filter(f => f.test)
        .length,

    files
  };
}

module.exports = {
  buildRepositoryIndex
};
