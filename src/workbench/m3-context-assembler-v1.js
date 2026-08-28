'use strict';

const inspector=
  require('./safe-file-inspector-v1');

const drilldown=
  require('./symbol-drilldown-v1');

const MAX_FILES=6;
const MAX_CHARS=24000;

function assemble({
  root=process.cwd(),
  files=[],
  symbols=[]
}={}) {
  const selectedFiles=
    [...new Set(files)]
      .slice(0,MAX_FILES);

  const sections=[];

  for (
    const relative of
    selectedFiles
  ) {
    try {
      const item=
        inspector.inspect(
          root,
          relative
        );

      sections.push({
        type:'file',
        path:item.path,
        content:item.content
      });
    } catch (error) {
      sections.push({
        type:'file_error',
        path:relative,
        error:error.message
      });
    }
  }

  for (
    const symbol of
    symbols.slice(0,MAX_FILES)
  ) {
    try {
      sections.push({
        type:'symbol',
        ...drilldown.locate(
          root,
          symbol
        )
      });
    } catch (error) {
      sections.push({
        type:'symbol_error',
        file:symbol.file || null,
        name:symbol.name || null,
        error:error.message
      });
    }
  }

  let used=0;

  const bounded=[];

  for (const section of sections) {
    const serialized=
      JSON.stringify(section);

    if (
      used + serialized.length >
      MAX_CHARS
    ) break;

    used += serialized.length;
    bounded.push(section);
  }

  return {
    ok:true,
    readOnly:true,
    mutationAuthority:false,
    executionAuthority:false,
    gitPushAuthority:false,
    purchaseAuthority:false,
    sectionCount:bounded.length,
    approximateChars:used,
    maxChars:MAX_CHARS,
    sections:bounded
  };
}

module.exports={
  MAX_FILES,
  MAX_CHARS,
  assemble
};
