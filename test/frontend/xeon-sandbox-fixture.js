'use strict';

function answer() {
  return 40 + 2;
}

if (answer() !== 42) {
  process.exitCode=1;
}

module.exports={answer};
