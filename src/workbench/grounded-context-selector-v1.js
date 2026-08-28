'use strict';

const graph=
  require('./project-brain-graph-v1');

const context=
  require('./m3-context-assembler-v1');

const MAX_FILES=6;
const MAX_SYMBOLS=6;

function select({
  root=process.cwd(),
  files=[],
  symbols=[]
}={}) {
  const projectGraph=
    graph.build(root);

  const safeFiles=[
    ...new Set(
      files
        .map(String)
        .filter(Boolean)
    )
  ].slice(0,MAX_FILES);

  const safeSymbols=
    symbols
      .filter(
        item =>
          item &&
          item.file &&
          Number.isInteger(
            Number(item.line)
          )
      )
      .slice(0,MAX_SYMBOLS)
      .map(
        item => ({
          name:item.name || null,
          kind:item.kind || null,
          file:String(item.file),
          line:Number(item.line)
        })
      );

  const assembled=
    context.assemble({
      root,
      files:safeFiles,
      symbols:safeSymbols
    });

  const relatedEdges=
    projectGraph.edges
      .filter(
        edge =>
          safeFiles.some(
            file =>
              edge.from ===
                `file:${file}` ||
              edge.to ===
                `file:${file}`
          )
      )
      .slice(0,120);

  return {
    ok:true,
    readOnly:true,
    grounded:true,
    files:safeFiles,
    symbols:safeSymbols,
    context:assembled,
    relatedEdgeCount:
      relatedEdges.length,
    relatedEdges,
    mutationAuthority:false,
    executionAuthority:false,
    gitPushAuthority:false,
    purchaseAuthority:false
  };
}

module.exports={
  MAX_FILES,
  MAX_SYMBOLS,
  select
};
