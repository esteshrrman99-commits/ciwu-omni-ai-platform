'use strict';

const fs=require('node:fs');
const path=require('node:path');

const MAX_BYTES=200000;

const ALLOWED_ROOTS=[
  'src/',
  'public/',
  'test/',
  'data/sovereign/',
  'data/frontend/'
];

const ALLOWED_EXTENSIONS=new Set([
  '.js',
  '.json',
  '.html',
  '.css',
  '.md',
  '.sh',
  '.py',
  '.txt'
]);

const DENIED_PARTS=[
  '.git',
  '.ciwu-private',
  'node_modules',
  '.env',
  'credential',
  'credentials',
  'secret',
  'secrets',
  'token',
  'tokens',
  'private-key',
  'private_key',
  '.pem',
  '.p12',
  '.pfx',
  '.key',
  'id_rsa',
  'id_ed25519'
];

function normalize(value='') {
  const raw=String(value)
    .replaceAll('\\','/')
    .trim();

  if (
    !raw ||
    raw.startsWith('/') ||
    /^[A-Za-z]:\//.test(raw)
  ) {
    throw new Error('INVALID_FILE_PATH');
  }

  const normalized=
    path.posix.normalize(raw);

  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new Error('PATH_TRAVERSAL_BLOCKED');
  }

  return normalized.replace(/^\.\/+/,'');
}

function denied(relative) {
  const lower=
    normalize(relative).toLowerCase();

  return DENIED_PARTS.some(
    part =>
      lower === part ||
      lower.includes(`/${part}`) ||
      lower.includes(part)
  );
}

function allowedRoot(relative) {
  const p=normalize(relative);

  return ALLOWED_ROOTS.some(
    root =>
      p === root.slice(0,-1) ||
      p.startsWith(root)
  );
}

function inspectable(relative) {
  const p=normalize(relative);

  if (!allowedRoot(p))
    return false;

  if (denied(p))
    return false;

  return ALLOWED_EXTENSIONS.has(
    path.extname(p).toLowerCase()
  );
}

function resolveSafe(root,relative) {
  const p=normalize(relative);

  if (!inspectable(p))
    throw new Error('FILE_NOT_INSPECTABLE');

  const rootReal=
    fs.realpathSync(root);

  const candidate=
    path.resolve(root,p);

  if (!fs.existsSync(candidate))
    throw new Error('FILE_NOT_FOUND');

  const candidateReal=
    fs.realpathSync(candidate);

  if (
    candidateReal !== rootReal &&
    !candidateReal.startsWith(
      rootReal + path.sep
    )
  ) {
    throw new Error('SYMLINK_ESCAPE_BLOCKED');
  }

  return {
    relative:p,
    absolute:candidateReal
  };
}

function inspect(root,relative) {
  const safe=
    resolveSafe(root,relative);

  const stat=
    fs.statSync(safe.absolute);

  if (!stat.isFile())
    throw new Error('NOT_A_FILE');

  if (stat.size > MAX_BYTES)
    throw new Error('FILE_TOO_LARGE');

  const content=
    fs.readFileSync(
      safe.absolute,
      'utf8'
    );

  const lines=
    content.split(/\r?\n/);

  return {
    ok:true,
    readOnly:true,
    path:safe.relative,
    bytes:stat.size,
    lineCount:lines.length,
    truncated:false,
    content
  };
}

module.exports={
  MAX_BYTES,
  ALLOWED_ROOTS,
  ALLOWED_EXTENSIONS,
  DENIED_PARTS,
  normalize,
  denied,
  allowedRoot,
  inspectable,
  resolveSafe,
  inspect
};


// CIWU_SAFE_INSPECTOR_PRIVACY_WRAPPER_V2
(() => {
  const protectedFiles = new Set([
    'src/data/entities-batch1.json'
  ]);

  const normalize = value =>
    String(value ?? '')
      .replaceAll('\\','/')
      .replace(/^\.\/+/, '');

  const isProtected = value =>
    protectedFiles.has(
      normalize(value)
    );

  const originalResolveSafe =
    module.exports.resolveSafe;

  if (
    typeof originalResolveSafe !== 'function'
  ) {
    throw new Error(
      'CIWU_RESOLVE_SAFE_EXPORT_MISSING'
    );
  }

  module.exports.resolveSafe =
    function ciwuProtectedResolveSafe(
      root,
      requestedPath,
      ...rest
    ) {
      if (isProtected(requestedPath)) {
        throw new Error(
          'FILE_NOT_ALLOWED'
        );
      }

      return originalResolveSafe.call(
        this,
        root,
        requestedPath,
        ...rest
      );
    };

  if (
    typeof module.exports.inspectable ===
    'function'
  ) {
    const originalInspectable =
      module.exports.inspectable;

    module.exports.inspectable =
      function ciwuProtectedInspectable(
        requestedPath,
        ...rest
      ) {
        if (isProtected(requestedPath)) {
          return false;
        }

        return originalInspectable.call(
          this,
          requestedPath,
          ...rest
        );
      };
  }
})();
