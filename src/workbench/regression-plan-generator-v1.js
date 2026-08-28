'use strict';

const graph=
  require('./project-brain-graph-v1');

const MAX_FILES=12;
const MAX_TESTS=40;

function generate({
  root=process.cwd(),
  files=[]
}={}) {
  const projectGraph=
    graph.build(root);

  const selected=[
    ...new Set(
      files.map(String)
    )
  ].slice(0,MAX_FILES);

  const impactedTests=
    new Set();

  const impactedDependencies=
    new Set();

  for (const file of selected) {
    for (
      const edge of
      projectGraph.edges
    ) {
      if (
        edge.relationship ===
          'TEST_REFERENCES_SOURCE' &&
        edge.to ===
          `file:${file}`
      ) {
        impactedTests.add(
          edge.from.replace(
            /^file:/,
            ''
          )
        );
      }

      if (
        edge.relationship ===
          'DEPENDS_ON_FILE' &&
        (
          edge.from ===
            `file:${file}` ||
          edge.to ===
            `file:${file}`
        )
      ) {
        impactedDependencies.add(
          edge.from.replace(
            /^file:/,
            ''
          )
        );

        impactedDependencies.add(
          edge.to.replace(
            /^file:/,
            ''
          )
        );
      }
    }
  }

  const tests=[
    ...impactedTests
  ].slice(0,MAX_TESTS);

  return {
    ok:true,
    readOnly:true,
    planningOnly:true,
    selectedFiles:selected,
    impactedTests:tests,
    impactedDependencies:[
      ...impactedDependencies
    ],
    proposedCommands:
      tests.map(
        test =>
          `node ${JSON.stringify(test)}`
      ),
    commandsExecuted:false,
    mutationAuthority:false,
    executionAuthority:false
  };
}

module.exports={
  MAX_FILES,
  MAX_TESTS,
  generate
};
