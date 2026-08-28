'use strict';

const path =
  require('node:path');

const {
  retrieve
} = require(
  './context-engine'
);

const {
  assemble
} = require(
  './prompt-assembler'
);

function build({
  projectRoot,
  query,
  task,
  topK = 8,
  maxChars = 40000
}) {
  const root =
    path.resolve(
      projectRoot
    );

  const contexts =
    retrieve(
      root,
      query,
      { topK }
    );

  return assemble({
    task,
    contexts,
    maxChars
  });
}

module.exports = {
  build
};
