'use strict';

const ALLOWED=new Set([
  'function',
  'class',
  'method',
  'variable',
  'constant',
  'route',
  'module',
  'unknown'
]);

function normalize(symbol={}) {
  const kind=
    ALLOWED.has(symbol.kind)
      ? symbol.kind
      : 'unknown';

  const line=Number(symbol.line);

  return {
    name:String(symbol.name || 'UNKNOWN'),
    kind,
    file:String(symbol.file || ''),
    line:
      Number.isInteger(line) && line > 0
        ? line
        : null,
    exported:
      symbol.exported === true
  };
}

function group(symbols=[]) {
  const result={};

  for (const item of symbols.map(normalize)) {
    const key=item.file || 'UNKNOWN';

    if (!result[key])
      result[key]=[];

    result[key].push(item);
  }

  return result;
}

module.exports={
  normalize,
  group
};
