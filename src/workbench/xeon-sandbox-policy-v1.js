'use strict';

const path=require('node:path');

const PROTECTED_FILES=
  new Set([
    'src/data/entities-batch1.json'
  ]);

const DENIED_PREFIXES=[
  '.git/',
  '.ciwu-private/',
  'node_modules/'
];

const ALLOWED_ROOTS=[
  'src/',
  'public/',
  'test/',
  'data/frontend/',
  'data/sovereign/'
];

const ALLOWED_EXTENSIONS=
  new Set([
    '.js',
    '.json',
    '.html',
    '.css',
    '.md',
    '.txt'
  ]);

const MAX_FILES=24;
const MAX_FILE_BYTES=200000;
const MAX_PATCH_OPERATIONS=24;
const MAX_REPLACEMENT_CHARS=50000;

function normalize(value) {
  return String(value ?? '')
    .replaceAll('\\','/')
    .replace(/^\.\/+/,'');
}

function assertSafeRelative(value) {
  const file=normalize(value);

  if (
    !file ||
    file.startsWith('/') ||
    /^[A-Za-z]:\//.test(file) ||
    file.split('/').includes('..')
  ) {
    throw new Error(
      'XEON_PATH_NOT_SAFE'
    );
  }

  if (
    PROTECTED_FILES.has(file)
  ) {
    throw new Error(
      'XEON_PROTECTED_FILE_DENIED'
    );
  }

  if (
    DENIED_PREFIXES.some(
      prefix =>
        file ===
          prefix.slice(0,-1) ||
        file.startsWith(prefix)
    )
  ) {
    throw new Error(
      'XEON_DENIED_PREFIX'
    );
  }

  if (
    !ALLOWED_ROOTS.some(
      root =>
        file.startsWith(root)
    )
  ) {
    throw new Error(
      'XEON_ROOT_NOT_ALLOWED'
    );
  }

  if (
    !ALLOWED_EXTENSIONS.has(
      path.posix.extname(file)
    )
  ) {
    throw new Error(
      'XEON_EXTENSION_NOT_ALLOWED'
    );
  }

  return file;
}

function assertPatchOperation(op) {
  if (
    !op ||
    typeof op !== 'object'
  ) {
    throw new Error(
      'XEON_PATCH_OPERATION_REQUIRED'
    );
  }

  const file=
    assertSafeRelative(op.file);

  if (
    op.type !== 'replace_exact'
  ) {
    throw new Error(
      'XEON_PATCH_TYPE_NOT_ALLOWED'
    );
  }

  const before=
    String(op.before ?? '');

  const after=
    String(op.after ?? '');

  if (!before) {
    throw new Error(
      'XEON_PATCH_BEFORE_REQUIRED'
    );
  }

  if (
    before.length >
      MAX_REPLACEMENT_CHARS ||
    after.length >
      MAX_REPLACEMENT_CHARS
  ) {
    throw new Error(
      'XEON_PATCH_CONTENT_TOO_LARGE'
    );
  }

  return {
    type:'replace_exact',
    file,
    before,
    after
  };
}

module.exports={
  PROTECTED_FILES,
  DENIED_PREFIXES,
  ALLOWED_ROOTS,
  ALLOWED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_PATCH_OPERATIONS,
  MAX_REPLACEMENT_CHARS,
  normalize,
  assertSafeRelative,
  assertPatchOperation
};
