'use strict';

const IMPORT_AUTHORITY =
  'READ_IMPORT_ONLY';

const FORBIDDEN_AUTHORITIES =
  Object.freeze([
    'WRITE',
    'EXECUTE',
    'COMMIT',
    'PUSH',
    'DEPLOY'
  ]);

function inertImportedMessage(
  message
) {
  return {
    ...message,
    import_authority:
      IMPORT_AUTHORITY,
    tool_execution_allowed:
      false,
    mutation_authority:
      false,
    imported_content_inert:
      true
  };
}

function assertImportIsInert(
  record
) {
  if (
    !record ||
    record.import_authority !==
      IMPORT_AUTHORITY
  ) {
    throw new Error(
      'IMPORT_AUTHORITY_INVALID'
    );
  }

  if (
    record.tool_execution_allowed !==
      false ||
    record.mutation_authority !==
      false
  ) {
    throw new Error(
      'IMPORT_AUTHORITY_ESCALATION_BLOCKED'
    );
  }

  return true;
}

module.exports = {
  IMPORT_AUTHORITY,
  FORBIDDEN_AUTHORITIES,
  inertImportedMessage,
  assertImportIsInert
};
