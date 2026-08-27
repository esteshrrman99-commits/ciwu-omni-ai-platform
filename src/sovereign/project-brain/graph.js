'use strict';

class ProjectGraph {
  constructor() {
    this.nodes =
      new Map();

    this.edges = [];
  }

  addNode({
    id,
    type,
    metadata = {}
  }) {
    if (!id || !type) {
      throw new Error(
        'NODE_ID_AND_TYPE_REQUIRED'
      );
    }

    this.nodes.set(
      id,
      {
        id,
        type,
        metadata
      }
    );

    return this.nodes.get(id);
  }

  addEdge({
    from,
    to,
    type,
    evidence
  }) {
    if (
      !this.nodes.has(from) ||
      !this.nodes.has(to)
    ) {
      throw new Error(
        'GRAPH_NODE_MISSING'
      );
    }

    if (!evidence) {
      throw new Error(
        'EDGE_EVIDENCE_REQUIRED'
      );
    }

    const edge = {
      from,
      to,
      type,
      evidence
    };

    this.edges.push(edge);

    return edge;
  }

  neighbors(id) {
    return this.edges
      .filter(
        edge =>
          edge.from === id ||
          edge.to === id
      )
      .map(edge => ({
        edge,

        node:
          this.nodes.get(
            edge.from === id
              ? edge.to
              : edge.from
          )
      }));
  }

  snapshot() {
    return {
      nodes:
        [...this.nodes.values()],

      edges:
        [...this.edges]
    };
  }
}

module.exports = {
  ProjectGraph
};
