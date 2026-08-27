'use strict';

/*
 * EONS M5.3 — Evidence Orchestration Engine
 *
 * Truth-state rules:
 *
 * VERIFIED
 * SUPPORTED
 * PARTIALLY_SUPPORTED
 * USER_REPORTED
 * INFERRED
 * CONFLICTED
 * UNVERIFIED
 * INSUFFICIENT_DATA
 * SUPERSEDED
 *
 * Never represent missing telemetry as a measured zero.
 */

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

function nowIso() {
  return new Date().toISOString();
}

function finiteNumber(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  );
}

function normalizeMetric(value, source) {
  /*
   * Critical M5.3 contract:
   *
   * 0 is preserved ONLY when the upstream source
   * explicitly supplies numeric zero.
   *
   * undefined/null/missing is NOT converted to zero.
   */
  if (finiteNumber(value)) {
    return {
      state: 'VERIFIED',
      value,
      display: String(value),
      source,
      observedAt: nowIso()
    };
  }

  return {
    state: 'INSUFFICIENT_DATA',
    value: null,
    display: 'NOT REPORTED',
    source,
    observedAt: nowIso()
  };
}

function normalizeService({
  id,
  endpoint,
  response,
  ok
}) {
  return {
    id,
    endpoint,
    availability:
      ok === true
        ? 'LIVE'
        : 'UNAVAILABLE',
    evidenceState:
      ok === true
        ? 'VERIFIED'
        : 'INSUFFICIENT_DATA',
    observedAt: nowIso(),
    response:
      response ?? null
  };
}

function evidenceItem({
  claim,
  value = null,
  truthState = 'UNVERIFIED',
  sourceClass = 'UNKNOWN',
  sourceId = null,
  confidence = null,
  rationale = null,
  conflicts = []
}) {
  if (!TRUTH_STATES.includes(truthState)) {
    truthState = 'UNVERIFIED';
  }

  if (!SOURCE_CLASSES.includes(sourceClass)) {
    sourceClass = 'UNKNOWN';
  }

  return {
    claim,
    value,
    truthState,
    sourceClass,
    sourceId,
    confidence:
      finiteNumber(confidence)
        ? Math.max(0, Math.min(1, confidence))
        : null,
    rationale,
    conflicts:
      Array.isArray(conflicts)
        ? conflicts
        : [],
    observedAt: nowIso()
  };
}

function resolveConflict(items = []) {
  const clean =
    items.filter(Boolean);

  if (!clean.length) {
    return {
      state: 'INSUFFICIENT_DATA',
      winner: null,
      alternatives: []
    };
  }

  if (clean.length === 1) {
    return {
      state:
        clean[0].truthState ||
        'UNVERIFIED',
      winner: clean[0],
      alternatives: []
    };
  }

  const ranked = [...clean].sort((a, b) => {
    const ca =
      finiteNumber(a.confidence)
        ? a.confidence
        : -1;

    const cb =
      finiteNumber(b.confidence)
        ? b.confidence
        : -1;

    return cb - ca;
  });

  const first = ranked[0];
  const second = ranked[1];

  const conflict =
    JSON.stringify(first.value) !==
    JSON.stringify(second.value);

  return {
    state:
      conflict
        ? 'CONFLICTED'
        : first.truthState,
    winner:
      conflict
        ? null
        : first,
    alternatives: ranked,
    explanation:
      conflict
        ? 'Available evidence contains materially different values.'
        : 'Available evidence is materially consistent.'
  };
}

function treatmentComparison(options = []) {
  return options.map(option => ({
    name:
      String(
        option?.name ||
        'Unnamed option'
      ),

    purpose:
      option?.purpose ?? null,

    evidence:
      Array.isArray(option?.evidence)
        ? option.evidence
        : [],

    benefits:
      Array.isArray(option?.benefits)
        ? option.benefits
        : [],

    tradeoffs:
      Array.isArray(option?.tradeoffs)
        ? option.tradeoffs
        : [],

    patientFactors:
      Array.isArray(option?.patientFactors)
        ? option.patientFactors
        : [],

    truthState:
      option?.truthState ||
      'UNVERIFIED',

    /*
     * Explicitly non-prescriptive.
     */
    recommendation:
      null
  }));
}

function longitudinalTimeline(events = []) {
  return events
    .filter(Boolean)
    .map(event => ({
      at:
        event.at ||
        null,

      type:
        event.type ||
        'UNKNOWN',

      label:
        event.label ||
        '',

      value:
        event.value ?? null,

      sourceId:
        event.sourceId ?? null,

      truthState:
        event.truthState ||
        'UNVERIFIED'
    }))
    .sort((a, b) => {
      const aa =
        Date.parse(a.at || '') || 0;
      const bb =
        Date.parse(b.at || '') || 0;

      return aa - bb;
    });
}

function patientContextGraph(context = {}) {
  return {
    patientFacts:
      Array.isArray(context.patientFacts)
        ? context.patientFacts
        : [],

    conditions:
      Array.isArray(context.conditions)
        ? context.conditions
        : [],

    medications:
      Array.isArray(context.medications)
        ? context.medications
        : [],

    labs:
      Array.isArray(context.labs)
        ? context.labs
        : [],

    goals:
      Array.isArray(context.goals)
        ? context.goals
        : [],

    /*
     * Missing facts remain missing.
     */
    assumptions: []
  };
}

function buildOrchestration({
  metrics = {},
  services = [],
  claims = [],
  patientContext = {},
  timeline = [],
  treatmentOptions = []
} = {}) {
  return {
    success: true,
    engine: 'EONS Evidence Orchestration Engine',
    version: '5.3.0',
    generatedAt: nowIso(),

    boundary:
      'Educational clinical decision support; no autonomous diagnosis or prescribing.',

    truthStates: TRUTH_STATES,
    sourceClasses: SOURCE_CLASSES,

    telemetry: {
      models:
        normalizeMetric(
          metrics.models,
          'runtime'
        ),

      providers:
        normalizeMetric(
          metrics.providers,
          'runtime'
        ),

      entities:
        normalizeMetric(
          metrics.entities,
          'runtime'
        ),

      relations:
        normalizeMetric(
          metrics.relations,
          'runtime'
        ),

      capabilities:
        normalizeMetric(
          metrics.capabilities,
          'runtime'
        )
    },

    services:
      services.map(normalizeService),

    evidence:
      claims.map(evidenceItem),

    patientContext:
      patientContextGraph(
        patientContext
      ),

    timeline:
      longitudinalTimeline(
        timeline
      ),

    treatments:
      treatmentComparison(
        treatmentOptions
      ),

    provenance: {
      generatedBy:
        'EONS M5.3',

      syntheticMetrics:
        false,

      zeroSuppression:
        false,

      missingValuesBecomeZero:
        false
    }
  };
}

module.exports = {
  TRUTH_STATES,
  SOURCE_CLASSES,
  normalizeMetric,
  normalizeService,
  evidenceItem,
  resolveConflict,
  treatmentComparison,
  longitudinalTimeline,
  patientContextGraph,
  buildOrchestration
};
