'use strict';

const path = require('node:path');

const ALLOWED =
  new Set([
    'replace'
  ]);

function safeRelativePath(
  file
) {
  if (
    typeof file !==
    'string'
  ) {
    return false;
  }

  if (
    path.isAbsolute(file)
  ) {
    return false;
  }

  const normalized =
    path.normalize(file);

  if (
    normalized.startsWith(
      '..'
    )
  ) {
    return false;
  }

  return (
    normalized !== '.' &&
    normalized.length > 0
  );
}

function validateOperation(
  operation
) {
  if (
    !operation ||
    !ALLOWED.has(
      operation.type
    )
  ) {
    throw new Error(
      'PATCH_OPERATION_NOT_ALLOWED'
    );
  }

  if (
    !safeRelativePath(
      operation.file
    )
  ) {
    throw new Error(
      'UNSAFE_PATCH_PATH'
    );
  }

  if (
    typeof operation.before !==
      'string' ||
    typeof operation.after !==
      'string'
  ) {
    throw new Error(
      'PATCH_TEXT_REQUIRED'
    );
  }

  if (
    operation.before.length ===
    0
  ) {
    throw new Error(
      'EMPTY_MATCH_FORBIDDEN'
    );
  }

  return true;
}

function validatePlan(
  plan,
  {
    maxOperations = 20
  } = {}
) {
  if (
    !plan ||
    !Array.isArray(
      plan.operations
    )
  ) {
    throw new Error(
      'PATCH_OPERATIONS_REQUIRED'
    );
  }

  if (
    plan.operations.length ===
    0
  ) {
    throw new Error(
      'EMPTY_PATCH_PLAN'
    );
  }

  if (
    plan.operations.length >
    maxOperations
  ) {
    throw new Error(
      'PATCH_OPERATION_LIMIT'
    );
  }

  for (
    const operation of
    plan.operations
  ) {
    validateOperation(
      operation
    );
  }

  return true;
}

module.exports = {
  ALLOWED,
  safeRelativePath,
  validateOperation,
  validatePlan
};
