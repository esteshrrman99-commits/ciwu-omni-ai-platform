'use strict';

const fs=require('node:fs');

const inspector=
  require('./safe-file-inspector-v1');

const CONTEXT_RADIUS=4;

function locate(
  root,
  symbol={}
) {
  const file=
    symbol.file;

  const line=
    Number(symbol.line);

  if (!file)
    throw new Error('SYMBOL_FILE_REQUIRED');

  if (
    !Number.isInteger(line) ||
    line < 1
  ) {
    throw new Error('SYMBOL_LINE_REQUIRED');
  }

  const safe=
    inspector.resolveSafe(
      root,
      file
    );

  const stat=
    fs.statSync(safe.absolute);

  if (stat.size > inspector.MAX_BYTES)
    throw new Error('FILE_TOO_LARGE');

  const lines=
    fs.readFileSync(
      safe.absolute,
      'utf8'
    ).split(/\r?\n/);

  if (line > lines.length)
    throw new Error('SYMBOL_LINE_OUT_OF_RANGE');

  const start=
    Math.max(
      1,
      line-CONTEXT_RADIUS
    );

  const end=
    Math.min(
      lines.length,
      line+CONTEXT_RADIUS
    );

  const context=[];

  for (
    let number=start;
    number<=end;
    number++
  ) {
    context.push({
      line:number,
      text:lines[number-1],
      target:number === line
    });
  }

  return {
    ok:true,
    readOnly:true,
    name:symbol.name || null,
    kind:symbol.kind || null,
    file,
    line,
    contextStart:start,
    contextEnd:end,
    context
  };
}

module.exports={
  CONTEXT_RADIUS,
  locate
};
