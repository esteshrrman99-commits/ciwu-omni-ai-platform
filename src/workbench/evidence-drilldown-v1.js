'use strict';

const fs=require('node:fs');
const path=require('node:path');

const ALLOWED_PREFIXES=[
  'data/sovereign/',
  'data/frontend/'
];

function normalize(value='') {
  const p=
    path.posix.normalize(
      String(value)
        .replaceAll('\\','/')
        .replace(/^\/+/,'')
    );

  if (
    !p ||
    p === '..' ||
    p.startsWith('../')
  ) {
    throw new Error('INVALID_EVIDENCE_PATH');
  }

  return p;
}

function allowed(relative) {
  const p=normalize(relative);

  return (
    p.endsWith('.json') &&
    ALLOWED_PREFIXES.some(
      prefix =>
        p.startsWith(prefix)
    ) &&
    !p.includes('.ciwu-private') &&
    !p.includes('.env')
  );
}

function read(
  root,
  relative
) {
  const p=normalize(relative);

  if (!allowed(p))
    throw new Error('EVIDENCE_NOT_ALLOWED');

  const rootReal=
    fs.realpathSync(root);

  const candidate=
    path.resolve(root,p);

  if (!fs.existsSync(candidate))
    throw new Error('EVIDENCE_NOT_FOUND');

  const real=
    fs.realpathSync(candidate);

  if (
    real !== rootReal &&
    !real.startsWith(
      rootReal + path.sep
    )
  ) {
    throw new Error('EVIDENCE_ESCAPE_BLOCKED');
  }

  const stat=
    fs.statSync(real);

  if (
    !stat.isFile() ||
    stat.size > 250000
  ) {
    throw new Error('EVIDENCE_SIZE_BLOCKED');
  }

  const data=
    JSON.parse(
      fs.readFileSync(
        real,
        'utf8'
      )
    );

  return {
    ok:true,
    readOnly:true,
    file:p,
    schema:data.schema || null,
    generation:data.generation || null,
    marker:data.marker || null,
    milestoneStart:
      data.milestoneStart ?? null,
    milestoneEnd:
      data.milestoneEnd ?? null,
    focus:data.focus || null,
    keys:
      Object.keys(data).sort(),
    record:data
  };
}

module.exports={
  ALLOWED_PREFIXES,
  normalize,
  allowed,
  read
};
