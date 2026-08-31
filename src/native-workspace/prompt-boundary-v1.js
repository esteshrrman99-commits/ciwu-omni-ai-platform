'use strict';

const crypto =
  require('node:crypto');

const CURRENT_INSTRUCTION_CLASS =
  'CURRENT_USER_INSTRUCTION';

const HISTORICAL_CONTEXT_CLASS =
  'NON_AUTHORITATIVE_CONTEXT';

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      String(value || '')
    )
    .digest('hex');
}

function requireCurrentInstruction(
  value
) {
  const text =
    String(value || '')
      .trim();

  if (!text) {
    throw new Error(
      'CURRENT_USER_INSTRUCTION_REQUIRED'
    );
  }

  if (
    text.length >
    20000
  ) {
    throw new Error(
      'CURRENT_USER_INSTRUCTION_TOO_LARGE'
    );
  }

  return text;
}

function provenanceHeader(
  row,
  ordinal
) {
  return {
    ordinal,
    source_kind:
      row.source_kind,
    context_authority:
      row.context_authority,
    operational_authority:false,
    tool_execution_allowed:false,
    mutation_authority:false,
    source_sha256:
      row.provenance &&
      row.provenance.source_sha256
        ? row.provenance.source_sha256
        : null,
    source_file:
      row.provenance &&
      row.provenance.source_file
        ? row.provenance.source_file
        : null,
    content_sha256:
      row.content_sha256 ||
      sha256(
        row.content
      )
  };
}

function buildPromptEnvelope({
  current_instruction,
  context_rows,
  query,
  budget
}) {
  const instruction =
    requireCurrentInstruction(
      current_instruction
    );

  const historical =
    context_rows.map(
      (row,index) => ({
        class:
          HISTORICAL_CONTEXT_CLASS,
        provenance:
          provenanceHeader(
            row,
            index
          ),
        content:
          row.content
      })
    );

  return {
    version:1,
    boundary_policy:
      'CURRENT_INSTRUCTION_SEPARATE_FROM_HISTORICAL_CONTEXT',
    current:{
      class:
        CURRENT_INSTRUCTION_CLASS,
      authoritative_for_intent:
        true,
      operational_authority:
        false,
      tool_execution_allowed:
        false,
      mutation_authority:
        false,
      content:
        instruction,
      content_sha256:
        sha256(
          instruction
        )
    },
    historical_context:{
      class:
        HISTORICAL_CONTEXT_CLASS,
      authoritative_for_intent:
        false,
      operational_authority:
        false,
      tool_execution_allowed:
        false,
      mutation_authority:
        false,
      query:
        String(query || ''),
      budget,
      items:
        historical
    },
    model_authority:{
      tool_execution_allowed:false,
      mutation_authority:false,
      write_authority:false,
      execute_authority:false,
      commit_authority:false,
      push_authority:false,
      deploy_authority:false
    }
  };
}

function assertPromptBoundary(
  envelope
) {
  if (
    !envelope ||
    !envelope.current ||
    !envelope.historical_context
  ) {
    throw new Error(
      'PROMPT_BOUNDARY_INVALID'
    );
  }

  if (
    envelope.current.class !==
      CURRENT_INSTRUCTION_CLASS ||
    envelope.historical_context
      .class !==
      HISTORICAL_CONTEXT_CLASS
  ) {
    throw new Error(
      'PROMPT_BOUNDARY_CLASS_INVALID'
    );
  }

  if (
    envelope.historical_context
      .authoritative_for_intent !==
      false ||
    envelope.historical_context
      .operational_authority !==
      false
  ) {
    throw new Error(
      'HISTORICAL_CONTEXT_AUTHORITY_ESCALATION'
    );
  }

  if (
    envelope.model_authority
      .tool_execution_allowed !==
      false ||
    envelope.model_authority
      .write_authority !==
      false ||
    envelope.model_authority
      .execute_authority !==
      false ||
    envelope.model_authority
      .commit_authority !==
      false ||
    envelope.model_authority
      .push_authority !==
      false ||
    envelope.model_authority
      .deploy_authority !==
      false
  ) {
    throw new Error(
      'MODEL_AUTHORITY_BOUNDARY_INVALID'
    );
  }

  return true;
}

module.exports = {
  CURRENT_INSTRUCTION_CLASS,
  HISTORICAL_CONTEXT_CLASS,
  requireCurrentInstruction,
  buildPromptEnvelope,
  assertPromptBoundary
};
