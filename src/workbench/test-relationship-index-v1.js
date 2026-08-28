'use strict';

const fs=require('node:fs');
const path=require('node:path');

const inspector=
  require('./safe-file-inspector-v1');

const MAX_TESTS=250;

function normalizeRelative(
  fromFile,
  specifier
) {
  if (!specifier.startsWith('.'))
    return null;

  let target=
    path.posix.normalize(
      path.posix.join(
        path.posix.dirname(fromFile),
        specifier
      )
    );

  if (!path.posix.extname(target))
    target += '.js';

  return target;
}

function relationships(
  root,
  entries=[]
) {
  const tests=
    entries
      .filter(
        entry =>
          entry.type === 'file' &&
          entry.path.startsWith('test/') &&
          entry.path.endsWith('.js') &&
          inspector.inspectable(
            entry.path
          )
      )
      .slice(0,MAX_TESTS);

  const edges=[];

  for (const test of tests) {
    let safe;

    try {
      safe=
        inspector.resolveSafe(
          root,
          test.path
        );
    } catch (_) {
      continue;
    }

    const text=
      fs.readFileSync(
        safe.absolute,
        'utf8'
      );

    const patterns=[
      /require\(\s*['"]([^'"]+)['"]\s*\)/g,
      /from\s+['"]([^'"]+)['"]/g
    ];

    for (const regex of patterns) {
      let match;

      while (
        (match=regex.exec(text)) !== null
      ) {
        const target=
          normalizeRelative(
            test.path,
            match[1]
          );

        if (
          target &&
          (
            target.startsWith('src/') ||
            target.startsWith('public/')
          )
        ) {
          edges.push({
            test:test.path,
            target,
            relationship:
              'TEST_REFERENCES_SOURCE'
          });
        }
      }
    }
  }

  const deduped=[
    ...new Map(
      edges.map(
        edge => [
          `${edge.test}|${edge.target}`,
          edge
        ]
      )
    ).values()
  ];

  return {
    ok:true,
    readOnly:true,
    testCount:tests.length,
    edgeCount:deduped.length,
    edges:deduped
  };
}

module.exports={
  MAX_TESTS,
  normalizeRelative,
  relationships
};
