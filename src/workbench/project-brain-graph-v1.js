'use strict';

const repository=
  require('./repository-inventory-v2');

const symbols=
  require('./symbol-index-v2');

const dependencies=
  require('./dependency-graph-v1');

const tests=
  require('./test-relationship-index-v1');

const releases=
  require('./release-provenance-graph-v1');

function addNode(map,node) {
  if (!node?.id)
    return;

  if (!map.has(node.id))
    map.set(node.id,node);
}

function build(
  root=process.cwd()
) {
  const inventory=
    repository.inventory(root);

  const symbolIndex =
    typeof symbols.index === 'function'
      ? symbols.index(root)
      : typeof symbols.build === 'function'
        ? symbols.build(root)
        : typeof symbols.scan === 'function'
          ? symbols.scan(root)
          : typeof symbols.symbols === 'function'
            ? symbols.symbols(root)
            : typeof symbols.indexRepository === 'function'
              ? symbols.indexRepository(root)
              : typeof symbols.buildIndex === 'function'
                ? symbols.buildIndex(root)
                : null;

  if (!symbolIndex) {
    throw new Error(
      'CIWU_SYMBOL_INDEX_INTERFACE_UNSUPPORTED'
    );
  }

  const dependencyGraph=
    dependencies.build(
      root,
      inventory.entries || []
    );

  const testGraph=
    tests.relationships(
      root,
      inventory.entries || []
    );

  const releaseGraph=
    releases.build(root);

  const nodeMap=
    new Map();

  const edges=[];

  for (
    const entry of
    inventory.entries || []
  ) {
    addNode(
      nodeMap,
      {
        id:`file:${entry.path}`,
        type:'file',
        path:entry.path,
        language:
          entry.language || null,
        bytes:
          entry.size || null
      }
    );
  }

  for (
    const symbol of
    symbolIndex.symbols || []
  ) {
    const id=
      `symbol:${symbol.file}:${symbol.line}:${symbol.name || 'anonymous'}`;

    addNode(
      nodeMap,
      {
        id,
        type:'symbol',
        name:
          symbol.name || null,
        kind:
          symbol.kind || null,
        file:symbol.file,
        line:symbol.line
      }
    );

    edges.push({
      from:`file:${symbol.file}`,
      to:id,
      relationship:
        'DECLARES_SYMBOL'
    });
  }

  for (
    const edge of
    dependencyGraph.edges || []
  ) {
    const internal=
      edge.dependencyType ===
      'internal';

    edges.push({
      from:`file:${edge.from}`,
      to:internal
        ? `file:${edge.to}`
        : `external:${edge.to}`,
      relationship:internal
        ? 'DEPENDS_ON_FILE'
        : 'DEPENDS_ON_EXTERNAL',
      specifier:edge.specifier
    });

    if (!internal) {
      addNode(
        nodeMap,
        {
          id:`external:${edge.to}`,
          type:
            'external_dependency',
          name:edge.to
        }
      );
    }
  }

  for (
    const edge of
    testGraph.edges || []
  ) {
    edges.push({
      from:`file:${edge.test}`,
      to:`file:${edge.target}`,
      relationship:
        'TEST_REFERENCES_SOURCE'
    });
  }

  for (
    const node of
    releaseGraph.nodes || []
  ) {
    addNode(
      nodeMap,
      {
        ...node,
        id:`release:${node.id}`
      }
    );
  }

  for (
    const edge of
    releaseGraph.edges || []
  ) {
    edges.push({
      from:`release:${edge.from}`,
      to:`release:${edge.to}`,
      relationship:
        edge.relationship
    });
  }

  const nodes=[
    ...nodeMap.values()
  ];

  return {
    ok:true,
    readOnly:true,
    schema:
      'CIWU_PROJECT_BRAIN_GRAPH_V1',
    nodeCount:nodes.length,
    edgeCount:edges.length,
    nodes,
    edges
  };
}

module.exports={build};
