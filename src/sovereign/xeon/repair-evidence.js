'use strict';

const crypto =
  require('node:crypto');

function digest(
  value
) {
  return crypto
    .createHash('sha256')
    .update(
      String(value)
    )
    .digest('hex');
}

function build({
  task,
  before,
  after,
  testOutput,
  certification
}) {
  return {
    schema:
      'CIWU_XEON_REPAIR_EVIDENCE_V1',

    taskHash:
      digest(task),

    beforeHash:
      digest(before),

    afterHash:
      digest(after),

    testOutputHash:
      digest(testOutput),

    certification,

    createdAt:
      new Date()
        .toISOString()
  };
}

module.exports = {
  digest,
  build
};
