'use strict';

function validateMemory(record = {}) {
  const required = [
    'id',
    'class',
    'content',
    'provenance',
    'confidence',
    'timestamp'
  ];

  const missing = required.filter(
    key =>
      record[key] === undefined ||
      record[key] === null ||
      record[key] === ''
  );

  if (missing.length) {
    return {
      ok: false,
      reason: 'MISSING_REQUIRED_MEMORY_FIELDS',
      missing
    };
  }

  if (
    typeof record.confidence !== 'number' ||
    record.confidence < 0 ||
    record.confidence > 1
  ) {
    return {
      ok: false,
      reason: 'INVALID_CONFIDENCE'
    };
  }

  return {
    ok: true,
    reason: 'MEMORY_VALIDATED'
  };
}

module.exports = {
  validateMemory
};
