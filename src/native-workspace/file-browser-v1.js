'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  resolveInside
} = require('./path-guard-v1');

function list(root, relative = '.') {
  const dir = resolveInside(root, relative);

  const stat = fs.statSync(dir);

  if (!stat.isDirectory()) {
    throw new Error('NOT_A_DIRECTORY');
  }

  return fs.readdirSync(dir, {
    withFileTypes: true
  })
    .map(entry => ({
      name: entry.name,
      type:
        entry.isDirectory() ? 'directory' :
        entry.isFile() ? 'file' :
        'other'
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );
}

function readText(root, relative, maxBytes = 262144) {
  const file = resolveInside(root, relative);

  const stat = fs.statSync(file);

  if (!stat.isFile()) {
    throw new Error('NOT_A_FILE');
  }

  if (stat.size > maxBytes) {
    throw new Error('FILE_TOO_LARGE');
  }

  return fs.readFileSync(file, 'utf8');
}

function metadata(root, relative) {
  const file = resolveInside(root, relative);
  const stat = fs.statSync(file);

  return {
    path: path.relative(
      fs.realpathSync(root),
      file
    ),
    size: stat.size,
    is_file: stat.isFile(),
    is_directory: stat.isDirectory(),
    modified_ms: stat.mtimeMs
  };
}

module.exports = {
  list,
  readText,
  metadata
};
