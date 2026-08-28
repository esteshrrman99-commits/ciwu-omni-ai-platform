'use strict';

const path =
  require('node:path');

function normalize(file) {
  return file
    .replaceAll(
      path.sep,
      '/'
    );
}

function build(
  imports
) {
  const nodes =
    new Set();

  const edges = [];

  for (
    const item of
    imports
  ) {
    const from =
      normalize(
        item.from
      );

    const to =
      normalize(
        item.to
      );

    nodes.add(from);
    nodes.add(to);

    edges.push({
      from,
      to,
      type:
        item.type ||
        'IMPORTS'
    });
  }

  return {
    nodes:
      [...nodes]
        .sort(),

    edges
  };
}

function reverse(graph) {
  const map = {};

  for (
    const edge of
    graph.edges
  ) {
    map[edge.to] ||=
      [];

    map[edge.to]
      .push(
        edge.from
      );
  }

  return map;
}

function impacted(
  graph,
  changed
) {
  const rev =
    reverse(graph);

  const visited =
    new Set(
      changed
    );

  const queue =
    [...changed];

  while (
    queue.length
  ) {
    const current =
      queue.shift();

    for (
      const parent of
      rev[current] || []
    ) {
      if (
        visited.has(
          parent
        )
      ) continue;

      visited.add(
        parent
      );

      queue.push(
        parent
      );
    }
  }

  return [...visited];
}

module.exports = {
  normalize,
  build,
  reverse,
  impacted
};
