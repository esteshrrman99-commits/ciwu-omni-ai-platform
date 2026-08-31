'use strict';

const CONTEXT_AUTHORITIES =
  Object.freeze({
    NATIVE_CONVERSATION:
      'CONTEXT_READ_ONLY',
    PROJECT_MEMORY:
      'CONTEXT_READ_ONLY',
    IMPORTED_HISTORY:
      'READ_IMPORT_ONLY'
  });

const MUTATING_AUTHORITIES =
  Object.freeze([
    'WRITE',
    'EXECUTE',
    'COMMIT',
    'PUSH',
    'DEPLOY'
  ]);

function bindContextAuthority(
  sourceKind,
  record
) {
  const authority =
    CONTEXT_AUTHORITIES[
      sourceKind
    ];

  if (!authority) {
    throw new Error(
      'CONTEXT_SOURCE_KIND_INVALID'
    );
  }

  return {
    ...record,
    source_kind:
      sourceKind,
    context_authority:
      authority,
    operational_authority:
      false,
    tool_execution_allowed:
      false,
    mutation_authority:
      false
  };
}

function assertNonAuthoritative(
  record
) {
  if (
    !record ||
    record.operational_authority !==
      false ||
    record.tool_execution_allowed !==
      false ||
    record.mutation_authority !==
      false
  ) {
    throw new Error(
      'CONTEXT_AUTHORITY_ESCALATION_BLOCKED'
    );
  }

  if (
    MUTATING_AUTHORITIES.includes(
      record.context_authority
    )
  ) {
    throw new Error(
      'CONTEXT_MUTATING_AUTHORITY_BLOCKED'
    );
  }

  return true;
}

module.exports = {
  CONTEXT_AUTHORITIES,
  MUTATING_AUTHORITIES,
  bindContextAuthority,
  assertNonAuthoritative
};
