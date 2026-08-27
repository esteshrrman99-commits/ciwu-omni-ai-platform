#!/usr/bin/env node

'use strict';

const {
  eons,
  cortex,
  zortex
} = require('./src/eons');

const command = process.argv[2];

switch (command) {

  case 'status':
    console.log(
      JSON.stringify(
        eons.status(),
        null,
        2
      )
    );
    break;

  case 'discover':
    console.log(
      JSON.stringify(
        zortex.discoveryPolicy(),
        null,
        2
      )
    );
    break;

  case 'classify': {
    const task =
      process.argv.slice(3).join(' ');

    console.log(
      JSON.stringify(
        cortex.classify(task),
        null,
        2
      )
    );
    break;
  }

  case 'help':
  default:

    console.log(`
EONS OMNIMODEL FRONTIER

Commands:

  node eons-cli.js status
  node eons-cli.js discover
  node eons-cli.js classify "your research question"

Modules:

  EONS
  CORTEX
  CODEX
  VORTEX
  ZORTEX
  NEUROTEX
  MEMORTEX
  TRUSTEX
  SECUREX
  EVOLVEX
`);

}
