'use strict';

const crypto=
  require('node:crypto');

function citationId(
  file,
  line
) {
  return crypto
    .createHash('sha256')
    .update(
      `${file}:${line}`
    )
    .digest('hex')
    .slice(0,16);
}

function build(
  grounded={}
) {
  const citations=[];

  for (
    const section of
    grounded?.context?.sections || []
  ) {
    if (
      section.type === 'file'
    ) {
      citations.push({
        id:citationId(
          section.path,
          1
        ),
        file:section.path,
        line:1,
        citationType:
          'FILE_CONTEXT'
      });
    }

    if (
      section.type === 'symbol'
    ) {
      citations.push({
        id:citationId(
          section.file,
          section.line
        ),
        file:section.file,
        line:section.line,
        name:
          section.name || null,
        kind:
          section.kind || null,
        citationType:
          'SYMBOL_CONTEXT'
      });
    }
  }

  return {
    ok:true,
    readOnly:true,
    citationCount:
      citations.length,
    citations,
    confidenceIsTruth:false,
    citationIsAuthorization:false
  };
}

module.exports={
  citationId,
  build
};
