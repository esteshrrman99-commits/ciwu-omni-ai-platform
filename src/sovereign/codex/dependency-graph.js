'use strict';

function graph(index) {
  const nodes = [];
  const edges = [];

  for (
    const file of
    index.files || []
  ) {
    nodes.push(
      file.path
    );

    for (
      const dependency of
      file.imports || []
    ) {
      edges.push({
        from: file.path,
        to: dependency,
        type: 'IMPORTS'
      });
    }
  }

  return {
    nodes,
    edges
  };
}

module.exports = {
  graph
};
