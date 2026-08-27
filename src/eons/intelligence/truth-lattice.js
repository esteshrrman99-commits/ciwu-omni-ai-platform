'use strict';

const SOURCE_CLASSES = Object.freeze([
  'USER_PROVIDED',
  'UPLOADED_RECORD',
  'PLATFORM_DERIVED',
  'EXTERNAL_RESEARCH',
  'GENERAL_MEDICAL_KNOWLEDGE',
  'INFERRED',
  'UNKNOWN'
]);

const TRUTH_STATES = Object.freeze([
  'VERIFIED',
  'SUPPORTED',
  'PARTIALLY_SUPPORTED',
  'USER_REPORTED',
  'INFERRED',
  'CONFLICTED',
  'UNVERIFIED',
  'INSUFFICIENT_DATA',
  'SUPERSEDED'
]);

function clamp01(value) {
  const n = Number(value);
  return Number.isFinite(n)
    ? Math.max(0, Math.min(1, n))
    : 0;
}

function evidenceScore({
  sourceClass,
  verified,
  corroboration = 0,
  conflict = false
} = {}) {
  const base = {
    USER_PROVIDED: 0.45,
    UPLOADED_RECORD: 0.72,
    PLATFORM_DERIVED: 0.62,
    EXTERNAL_RESEARCH: 0.78,
    GENERAL_MEDICAL_KNOWLEDGE: 0.70,
    INFERRED: 0.35,
    UNKNOWN: 0.15
  }[sourceClass] ?? 0.15;

  let score =
    base +
    Math.min(Number(corroboration || 0) * 0.08, 0.16);

  if (verified) score += 0.12;
  if (conflict) score -= 0.30;

  return clamp01(score);
}

function classifyTruth(input = {}) {
  if (input.superseded) return 'SUPERSEDED';
  if (input.conflict) return 'CONFLICTED';

  const score = evidenceScore(input);

  if (input.verified && score >= 0.82) return 'VERIFIED';
  if (score >= 0.72) return 'SUPPORTED';
  if (score >= 0.52) return 'PARTIALLY_SUPPORTED';
  if (input.sourceClass === 'USER_PROVIDED') return 'USER_REPORTED';
  if (input.sourceClass === 'INFERRED') return 'INFERRED';
  if (score < 0.25) return 'INSUFFICIENT_DATA';

  return 'UNVERIFIED';
}

module.exports = {
  SOURCE_CLASSES,
  TRUTH_STATES,
  evidenceScore,
  classifyTruth
};
