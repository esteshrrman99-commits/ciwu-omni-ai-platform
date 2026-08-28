'use strict';

function parse(
  text
) {
  let value;

  try {
    value =
      JSON.parse(
        String(text)
      );
  } catch {
    throw new Error(
      'PATCH_JSON_REQUIRED'
    );
  }

  if (
    !value ||
    !Array.isArray(
      value.operations
    )
  ) {
    throw new Error(
      'PATCH_OPERATIONS_REQUIRED'
    );
  }

  if (
    value.operations.length >
    20
  ) {
    throw new Error(
      'PATCH_OPERATION_LIMIT'
    );
  }

  for (
    const op of
    value.operations
  ) {
    if (
      op.type !==
      'replace'
    ) {
      throw new Error(
        'PATCH_TYPE_BLOCKED'
      );
    }

    if (
      typeof op.file !==
      'string' ||
      typeof op.before !==
      'string' ||
      typeof op.after !==
      'string'
    ) {
      throw new Error(
        'INVALID_PATCH_OPERATION'
      );
    }
  }

  return value;
}

module.exports = {
  parse
};
