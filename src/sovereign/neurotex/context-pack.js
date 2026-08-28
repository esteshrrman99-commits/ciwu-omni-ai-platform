'use strict';

function pack(
  records,
  {
    limit = 12,
    maxChars = 20000
  } = {}
) {
  const selected = [];

  let chars = 0;

  for (
    const record of
    records.slice(0, limit)
  ) {
    const text =
      [
        `MEMORY_ID=${record.id}`,
        `TYPE=${record.type}`,
        `CONFIDENCE=${record.confidence}`,
        `PROVENANCE=${record.provenance}`,
        `CONTENT=${record.content}`
      ].join('\n');

    if (
      chars +
      text.length >
      maxChars
    ) break;

    selected.push(
      text
    );

    chars +=
      text.length;
  }

  return {
    text:
      selected.join(
        '\n\n'
      ),

    records:
      selected.length,

    chars
  };
}

module.exports = {
  pack
};
