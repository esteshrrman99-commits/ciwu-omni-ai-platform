'use strict';

const fs=require('node:fs');
const path=require('node:path');

const inspector=
  require('./safe-file-inspector-v1');

const MAX_FILES=300;

function normalizeSpecifier(
  fromFile,
  specifier
) {
  if (
    !specifier ||
    !specifier.startsWith('.')
  ) {
    return {
      type:'external',
      target:specifier
    };
  }

  const base=
    path.posix.dirname(fromFile);

  let resolved=
    path.posix.normalize(
      path.posix.join(
        base,
        specifier
      )
    );

  if (
    !path.posix.extname(resolved)
  ) {
    resolved += '.js';
  }

  return {
    type:'internal',
    target:resolved
  };
}

function importsFor(
  root,
  relative
) {
  if (
    !relative.endsWith('.js') ||
    !inspector.inspectable(relative)
  ) return [];

  let safe;

  try {
    safe=
      inspector.resolveSafe(
        root,
        relative
      );
  } catch (_) {
    return [];
  }

  const stat=
    fs.statSync(safe.absolute);

  if (stat.size > inspector.MAX_BYTES)
    return [];

  const text=
    fs.readFileSync(
      safe.absolute,
      'utf8'
    );

  const specs=[];

  const patterns=[
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
    /from\s+['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g
  ];

  for (const regex of patterns) {
    let match;

    while (
      (match=regex.exec(text)) !== null
    ) {
      specs.push(match[1]);
    }
  }

  return [
    ...new Set(specs)
  ].map(specifier => ({
    specifier,
    ...normalizeSpecifier(
      relative,
      specifier
    )
  }));
}

function build(
  root,
  entries=[]
) {
  const files=
    entries
      .filter(
        entry =>
          entry.type === 'file' &&
          entry.path.endsWith('.js') &&
          inspector.inspectable(entry.path)
      )
      .slice(0,MAX_FILES);

  const nodes=
    files.map(file => ({
      id:file.path,
      type:'file'
    }));

  const edges=[];

  for (const file of files) {
    for (
      const dependency of
      importsFor(
        root,
        file.path
      )
    ) {
      edges.push({
        from:file.path,
        to:dependency.target,
        dependencyType:
          dependency.type,
        specifier:
          dependency.specifier
      });
    }
  }

  return {
    ok:true,
    readOnly:true,
    nodeCount:nodes.length,
    edgeCount:edges.length,
    nodes,
    edges
  };
}

module.exports={
  MAX_FILES,
  normalizeSpecifier,
  importsFor,
  build
};
