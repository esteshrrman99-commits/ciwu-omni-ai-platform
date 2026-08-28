'use strict';

const CIWU_DENIED_INVENTORY_FILES = new Set([
  'src/data/entities-batch1.json'
]);


const fs=require('node:fs');
const path=require('node:path');

const ALLOWED_ROOTS=[
  'src/',
  'public/',
  'test/',
  'data/sovereign/',
  'data/frontend/'
];

function normalize(value='') {
  return String(value)
    .replaceAll('\\','/')
    .replace(/^\/+/,'');
}

function allowed(relative) {
  const p=normalize(relative);

  return ALLOWED_ROOTS.some(
    prefix =>
      p === prefix.slice(0,-1) ||
      p.startsWith(prefix)
  );
}

function language(file) {
  const ext=path.extname(file).toLowerCase();

  const map={
    '.js':'JavaScript',
    '.json':'JSON',
    '.html':'HTML',
    '.css':'CSS',
    '.md':'Markdown',
    '.sh':'Shell',
    '.py':'Python'
  };

  return map[ext] || 'Other';
}

function walk(root,relative='') {
  const absolute=path.join(root,relative);

  if (!fs.existsSync(absolute))
    return [];

  const results=[];

  for (
    const entry of
    fs.readdirSync(
      absolute,
      {withFileTypes:true}
    )
  ) {
    if (
      entry.name === '.git' ||
      entry.name === '.ciwu-private' ||
      entry.name === 'node_modules'
    ) continue;

    const child=
      normalize(
        path.posix.join(
          relative.replaceAll('\\','/'),
          entry.name
        )
      );

    if (entry.isDirectory()) {
      if (
        allowed(child) ||
        ALLOWED_ROOTS.some(
          prefix =>
            prefix.startsWith(
              child.endsWith('/')
                ? child
                : child + '/'
            )
        )
      ) {

      if (
        CIWU_DENIED_INVENTORY_FILES.has(
          child.replaceAll('\\','/')
        )
      ) {
        continue;
      }

results.push({
          path:child,
          type:'directory'
        });

        results.push(
          ...walk(root,child)
        );
      }
    } else if (
      entry.isFile() &&
      allowed(child)
    ) {
      const stat=
        fs.statSync(
          path.join(root,child)
        );

      results.push({
        path:child,
        type:'file',
        size:stat.size,
        language:language(child)
      });
    }
  }

  return results.sort(
    (a,b) =>
      a.path.localeCompare(b.path)
  );
}

function inventory(root=process.cwd()) {
  return {
    ok:true,
    readOnly:true,
    allowedRoots:[
      ...ALLOWED_ROOTS
    ],
    entries:walk(root)
  };
}

module.exports={
  ALLOWED_ROOTS,
  normalize,
  allowed,
  language,
  walk,
  inventory
};


// CIWU_REPOSITORY_PRIVACY_WRAPPER_V3
(() => {
  const protectedFiles = new Set([
    'src/data/entities-batch1.json'
  ]);

  const normalize = value =>
    String(value ?? '')
      .replaceAll('\\','/')
      .replace(/^\.\/+/, '');

  const originalInventory =
    module.exports.inventory;

  if (
    typeof originalInventory !== 'function'
  ) {
    throw new Error(
      'CIWU_INVENTORY_EXPORT_MISSING'
    );
  }

  module.exports.inventory =
    function ciwuPrivacyFilteredInventory(
      ...args
    ) {
      const result =
        originalInventory.apply(
          this,
          args
        );

      if (
        result &&
        Array.isArray(result.entries)
      ) {
        result.entries =
          result.entries.filter(
            entry => {
              const candidate =
                normalize(
                  entry?.path ??
                  entry?.file ??
                  entry?.name ??
                  ''
                );

              return !protectedFiles.has(
                candidate
              );
            }
          );
      }

      return result;
    };
})();
