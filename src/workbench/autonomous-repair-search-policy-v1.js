'use strict';

const xeon=
  require('./xeon-sandbox-policy-v1');

const MAX_CANDIDATES=8;
const MAX_TESTS=12;
const MAX_TOTAL_VALIDATIONS=48;
const MAX_OBJECTIVE_CHARS=2000;

function normalizeObjective(value) {
  const text=
    String(value ?? '').trim();

  if (
    !text ||
    text.length >
      MAX_OBJECTIVE_CHARS
  ) {
    throw new Error(
      'REPAIR_SEARCH_OBJECTIVE_INVALID'
    );
  }

  return text;
}

function assertCandidate(candidate) {
  if (
    !candidate ||
    typeof candidate !== 'object'
  ) {
    throw new Error(
      'REPAIR_SEARCH_CANDIDATE_REQUIRED'
    );
  }

  const operation=
    xeon.assertPatchOperation(
      candidate.operation
    );

  const label=
    String(
      candidate.label ?? ''
    ).trim();

  if (
    !label ||
    label.length > 160
  ) {
    throw new Error(
      'REPAIR_SEARCH_LABEL_INVALID'
    );
  }

  return {
    label,
    operation
  };
}

function assertCandidates(candidates) {
  if (
    !Array.isArray(candidates) ||
    candidates.length === 0 ||
    candidates.length >
      MAX_CANDIDATES
  ) {
    throw new Error(
      'REPAIR_SEARCH_CANDIDATE_COUNT_INVALID'
    );
  }

  return candidates.map(
    assertCandidate
  );
}

module.exports={
  MAX_CANDIDATES,
  MAX_TESTS,
  MAX_TOTAL_VALIDATIONS,
  MAX_OBJECTIVE_CHARS,
  normalizeObjective,
  assertCandidate,
  assertCandidates
};
