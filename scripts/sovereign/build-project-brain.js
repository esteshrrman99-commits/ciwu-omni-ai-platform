'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildRepositoryIndex
} = require(
  '../../src/sovereign/codex/repository-index'
);

const root =
  path.resolve(
    __dirname,
    '../..'
  );

const index =
  buildRepositoryIndex(root);

const destination =
  process.argv[2];

if (destination) {
  fs.writeFileSync(
    destination,
    JSON.stringify(
      index,
      null,
      2
    )
  );
}

console.log(
  `CODEX_FILE_COUNT=${index.fileCount}`
);

console.log(
  `CODEX_SYMBOL_COUNT=${index.symbolCount}`
);

console.log(
  `CODEX_TEST_FILES=${index.testFileCount}`
);

console.log(
  'CODEX_PROJECT_BRAIN_INDEX=PASS'
);
