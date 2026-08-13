'use strict';

const crypto = require('crypto');

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

const SOURCE_CLASSES = Object.freeze([
  'USER_PROVIDED',
  'UPLOADED_RECORD',
  'PLATFORM_DERIVED',
  'EXTERNAL_RESEARCH',
  'GENERAL_MEDICAL_KNOWLEDGE',
  'INFERRED',
  'UNKNOWN'
]);

const RELATIONSHIPS = Object.freeze([
  'SUPPORTS',
  'CONTRADICTS',
  'DERIVED_FROM',
  'SUPERSEDES',
  'OBSERVED_AT',
  'ASSOCIATED_WITH',
  'DEPENDS_ON',
  'REQUIRES_CONTEXT',
  'TREATMENT_FOR',
  'HAS_RISK',
  'HAS_BENEFIT'
]);

function id(prefix = 'node') {
  return `${prefix}_${crypto.randomUUID()}`;
}

function cleanText(value) {
  return String(value || '').trim();
}

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

function confidenceBand(score) {
  const s = clamp(score);

  if (s >= 0.85) return 'HIGH';
  if (s >= 0.60) return 'MODERATE';
  if (s > 0) return 'LOW';
  return 'UNKNOWN';
}

function sourceWeight(sourceClass) {
  switch (sourceClass) {
    case 'UPLOADED_RECORD':
      return 0.95;
    case 'PLATFORM_DERIVED':
      return 0.90;
    case 'EXTERNAL_RESEARCH':
      return 0.88;
    case 'GENERAL_MEDICAL_KNOWLEDGE':
      return 0.82;
    case 'USER_PROVIDED':
      return 0.60;
    case 'INFERRED':
      return 0.35;
    default:
      return 0.20;
  }
}

function normalizeEvidence(item = {}) {
  const sourceClass =
    SOURCE_CLASSES.includes(item.sourceClass)
      ? item.sourceClass
      : 'UNKNOWN';

  const relationship =
    RELATIONSHIPS.includes(item.relationship)
      ? item.relationship
      : 'SUPPORTS';

  return {
    evidenceId:
      cleanText(item.evidenceId) || id('evidence'),

    text:
      cleanText(item.text),

    sourceClass,

    relationship,

    source:
      item.source || null,

    observedAt:
      item.observedAt || null,

    confidence:
      clamp(
        item.confidence ??
        sourceWeight(sourceClass)
      ),

    metadata:
      item.metadata &&
      typeof item.metadata === 'object'
        ? item.metadata
        : {}
  };
}

function resolveConflict(items = []) {
  const evidence =
    Array.isArray(items)
      ? items.map(normalizeEvidence)
      : [];

  let support = 0;
  let contradict = 0;

  for (const item of evidence) {
    const weight =
      clamp(item.confidence) *
      sourceWeight(item.sourceClass);

    if (item.relationship === 'CONTRADICTS') {
      contradict += weight;
    } else if (item.relationship === 'SUPPORTS') {
      support += weight;
    }
  }

  const total = support + contradict;

  const score =
    total > 0
      ? support / total
      : 0;

  const hasSupport = support > 0;
  const hasContradiction = contradict > 0;

  let truthState = 'INSUFFICIENT_DATA';

  if (hasSupport && hasContradiction) {
    truthState = 'CONFLICTED';
  } else if (score >= 0.85) {
    truthState = 'VERIFIED';
  } else if (score >= 0.60) {
    truthState = 'SUPPORTED';
  } else if (score > 0) {
    truthState = 'PARTIALLY_SUPPORTED';
  }

  return {
    truthState,
    supportScore: support,
    contradictionScore: contradict,
    confidence: score,
    confidenceBand:
      confidenceBand(score)
  };
}

function buildClaim({
  claimText,
  scope = 'GENERAL_MEDICAL_KNOWLEDGE',
  patientSpecific = false,
  evidence = [],
  missingContext = [],
  timeline = [],
  metadata = {}
} = {}) {
  const text = cleanText(claimText);

  if (!text) {
    throw new Error('claimText is required');
  }

  const normalizedEvidence =
    Array.isArray(evidence)
      ? evidence.map(normalizeEvidence)
      : [];

  const conflict =
    resolveConflict(normalizedEvidence);

  return {
    claimId:
      id('claim'),

    claimText:
      text,

    truthState:
      conflict.truthState,

    confidence:
      conflict.confidence,

    confidenceBand:
      conflict.confidenceBand,

    scope,

    patientSpecific:
      Boolean(patientSpecific),

    sourceCount:
      normalizedEvidence.length,

    supportingEvidence:
      normalizedEvidence.filter(
        item =>
          item.relationship === 'SUPPORTS'
      ),

    conflictingEvidence:
      normalizedEvidence.filter(
        item =>
          item.relationship === 'CONTRADICTS'
      ),

    missingContext:
      Array.isArray(missingContext)
        ? [...new Set(
            missingContext
              .map(cleanText)
              .filter(Boolean)
          )]
        : [],

    timeline:
      Array.isArray(timeline)
        ? timeline
        : [],

    provenance:
      normalizedEvidence.map(
        item => ({
          evidenceId:
            item.evidenceId,
          sourceClass:
            item.sourceClass,
          source:
            item.source,
          relationship:
            item.relationship,
          observedAt:
            item.observedAt,
          confidence:
            item.confidence
        })
      ),

    metadata:
      metadata &&
      typeof metadata === 'object'
        ? metadata
        : {},

    generatedAt:
      new Date().toISOString()
  };
}

function buildGraph({
  claims = [],
  patientContext = null
} = {}) {
  const graphClaims =
    Array.isArray(claims)
      ? claims.map(buildClaim)
      : [];

  const nodes = [];
  const edges = [];

  for (const claim of graphClaims) {
    nodes.push({
      id: claim.claimId,
      type: 'Claim',
      data: claim
    });

    for (const evidence of [
      ...claim.supportingEvidence,
      ...claim.conflictingEvidence
    ]) {
      nodes.push({
        id: evidence.evidenceId,
        type: 'Evidence',
        data: evidence
      });

      edges.push({
        id: id('edge'),
        from: evidence.evidenceId,
        to: claim.claimId,
        relationship:
          evidence.relationship
      });
    }
  }

  return {
    success: true,
    milestone: 'M5.5',
    engine:
      'EONS Clinical Evidence Graph',
    truthStates:
      TRUTH_STATES,
    sourceClasses:
      SOURCE_CLASSES,
    relationships:
      RELATIONSHIPS,
    patientContext:
      patientContext || null,
    claims:
      graphClaims,
    nodes,
    edges,
    summary: {
      claims:
        graphClaims.length,
      evidence:
        nodes.filter(
          n => n.type === 'Evidence'
        ).length,
      conflicts:
        graphClaims.filter(
          c => c.truthState === 'CONFLICTED'
        ).length
    },
    generatedAt:
      new Date().toISOString()
  };
}

module.exports = {
  TRUTH_STATES,
  SOURCE_CLASSES,
  RELATIONSHIPS,
  normalizeEvidence,
  resolveConflict,
  buildClaim,
  buildGraph
};
