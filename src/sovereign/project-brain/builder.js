'use strict';

const {
  ProjectGraph
} = require('./graph');

function fromRepository(index) {
  const graph =
    new ProjectGraph();

  for (
    const file of
    index.files || []
  ) {
    const fileId =
      `file:${file.path}`;

    graph.addNode({
      id: fileId,

      type:
        file.test
          ? 'TEST_FILE'
          : 'SOURCE_FILE',

      metadata: {
        path:
          file.path,

        sha256:
          file.sha256 || null
      }
    });

    for (
      const symbol of
      file.symbols || []
    ) {
      const symbolId =
        `symbol:${file.path}:${symbol.name}`;

      graph.addNode({
        id:
          symbolId,

        type:
          'SYMBOL',

        metadata:
          symbol
      });

      graph.addEdge({
        from:
          fileId,

        to:
          symbolId,

        type:
          'DECLARES',

        evidence:
          file.path
      });
    }
  }

  return graph;
}

module.exports = {
  fromRepository
};
