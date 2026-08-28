'use strict';

function select(candidates) {
  return (candidates || [])
    .filter(
      candidate =>
        candidate?.admitted === true
    )
    .map(
      candidate => ({
        provider:
          candidate.provider,

        model:
          candidate.model,

        priceEvidenceHash:
          candidate.priceEvidenceHash
      })
    );
}

module.exports = {
  select
};
