'use strict';

function affected({
  changedFiles,
  dependencyGraph,
  testMap
}) {
  const changed =
    new Set(changedFiles);

  const impacted =
    new Set(changedFiles);

  let expanded = true;

  while (expanded) {
    expanded = false;

    for (
      const edge of
      dependencyGraph.edges || []
    ) {
      if (
        impacted.has(edge.to) &&
        !impacted.has(edge.from)
      ) {
        impacted.add(
          edge.from
        );

        expanded = true;
      }
    }
  }

  const tests =
    new Set();

  for (
    const mapping of
    testMap || []
  ) {
    if (
      impacted.has(
        mapping.source
      )
    ) {
      for (
        const test of
        mapping.tests
      ) {
        tests.add(test);
      }
    }
  }

  return {
    changed:
      [...changed],

    impacted:
      [...impacted],

    tests:
      [...tests]
  };
}

module.exports = {
  affected
};
