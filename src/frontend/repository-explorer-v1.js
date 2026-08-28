'use strict';

const path=require('node:path');

function normalizeEntry(entry={}) {
  const relative=String(entry.path || '')
    .replaceAll('\\','/')
    .replace(/^\/+/,'');

  if (
    relative.includes('../') ||
    relative === '..'
  ) {
    throw new Error('UNSAFE_REPOSITORY_PATH');
  }

  return {
    path:relative,
    type:
      entry.type === 'directory'
        ? 'directory'
        : 'file',
    size:
      Number.isFinite(Number(entry.size))
        ? Math.max(0,Number(entry.size))
        : null,
    language:
      entry.language || null
  };
}

function build(entries=[]) {
  return entries
    .map(normalizeEntry)
    .sort((a,b) => {
      if (a.type !== b.type)
        return a.type === 'directory' ? -1 : 1;

      return a.path.localeCompare(b.path);
    });
}

function basename(value='') {
  return path.posix.basename(
    String(value).replaceAll('\\','/')
  );
}

module.exports={
  normalizeEntry,
  build,
  basename
};
