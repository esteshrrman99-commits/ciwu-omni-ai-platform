'use strict';

const crypto =
  require('node:crypto');

function summarize(
  diff
) {
  const text =
    String(diff || '');

  return {
    bytes:
      Buffer.byteLength(
        text
      ),

    sha256:
      crypto
        .createHash('sha256')
        .update(text)
        .digest('hex'),

    addedLines:
      text
        .split('\n')
        .filter(
          x =>
            x.startsWith('+') &&
            !x.startsWith('+++')
        )
        .length,

    removedLines:
      text
        .split('\n')
        .filter(
          x =>
            x.startsWith('-') &&
            !x.startsWith('---')
        )
        .length
  };
}

module.exports = {
  summarize
};
