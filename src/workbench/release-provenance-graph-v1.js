'use strict';

const releases=
  require('./release-comparator-v1');

function build(
  root=process.cwd()
) {
  const list=
    releases.loadReleases(root);

  const nodes=[];
  const edges=[];

  for (const item of list) {
    const summary=
      releases.summarize(item);

    const id=
      summary.generation ||
      summary.file;

    nodes.push({
      id,
      type:'release',
      ...summary
    });
  }

  for (
    let i=1;
    i<nodes.length;
    i++
  ) {
    edges.push({
      from:nodes[i-1].id,
      to:nodes[i].id,
      relationship:
        'CERTIFIED_PREDECESSOR'
    });
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

module.exports={build};
