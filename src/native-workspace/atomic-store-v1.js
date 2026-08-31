'use strict';

const fs = require('node:fs');
const path = require('node:path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function atomicWriteJson(file, value) {
  const dir = path.dirname(file);
  ensureDir(dir);

  const tmp =
    file +
    '.tmp-' +
    process.pid +
    '-' +
    Date.now() +
    '-' +
    Math.random().toString(16).slice(2);

  const payload = JSON.stringify(value, null, 2) + '\n';

  let fd;

  try {
    fd = fs.openSync(tmp, 'wx', 0o600);
    fs.writeFileSync(fd, payload, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = undefined;

    fs.renameSync(tmp, file);

    try {
      const dirfd = fs.openSync(dir, 'r');
      fs.fsyncSync(dirfd);
      fs.closeSync(dirfd);
    } catch (_) {
      // Some Android/filesystem combinations do not permit directory fsync.
    }
  } catch (error) {
    if (fd !== undefined) {
      try { fs.closeSync(fd); } catch (_) {}
    }

    try { fs.unlinkSync(tmp); } catch (_) {}
    throw error;
  }

  return value;
}

module.exports = {
  ensureDir,
  readJson,
  atomicWriteJson
};
