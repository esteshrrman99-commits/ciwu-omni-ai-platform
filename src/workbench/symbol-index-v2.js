'use strict';

const fs=require('node:fs');
const path=require('node:path');

function symbolsForFile(root,relative) {
  if (
    !relative.endsWith('.js')
  ) return [];

  const absolute=
    path.join(root,relative);

  if (!fs.existsSync(absolute))
    return [];

  const lines=
    fs.readFileSync(
      absolute,
      'utf8'
    ).split(/\r?\n/);

  const out=[];

  const patterns=[
    {
      kind:'function',
      regex:
        /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/
    },
    {
      kind:'class',
      regex:
        /^\s*class\s+([A-Za-z_$][\w$]*)/
    },
    {
      kind:'variable',
      regex:
        /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/
    },
    {
      kind:'route',
      regex:
        /\b(?:app|router)\.(?:get|post|put|patch|delete)\(\s*['"`]([^'"`]+)/
    }
  ];

  lines.forEach((line,index) => {
    for (const p of patterns) {
      const match=line.match(p.regex);

      if (!match)
        continue;

      out.push({
        name:match[1],
        kind:p.kind,
        file:relative,
        line:index+1
      });

      break;
    }
  });

  return out;
}

function build(root,entries=[]) {
  const symbols=[];

  for (const entry of entries) {
    if (
      entry.type === 'file' &&
      entry.path.endsWith('.js')
    ) {
      symbols.push(
        ...symbolsForFile(
          root,
          entry.path
        )
      );
    }
  }

  return {
    ok:true,
    symbolCount:symbols.length,
    symbols
  };
}

module.exports={
  symbolsForFile,
  build
};
