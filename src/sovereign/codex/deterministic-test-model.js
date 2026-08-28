'use strict';

async function invoke(
  prompt
) {
  if (
    typeof prompt !==
      'string'
  ) {
    throw new Error(
      'PROMPT_REQUIRED'
    );
  }

  return JSON.stringify({
    operations: [
      {
        type:
          'replace',

        file:
          'fixture.js',

        before:
          'const value = 1;',

        after:
          'const value = 2;'
      }
    ]
  });
}

module.exports = {
  invoke
};
