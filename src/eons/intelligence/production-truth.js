'use strict';

const STATES = Object.freeze({
  VERIFIED: 'VERIFIED',
  SUPPORTED: 'SUPPORTED',
  SIMULATED: 'SIMULATED',
  RESEARCH: 'RESEARCH',
  USER_REPORTED: 'USER_REPORTED',
  INFERRED: 'INFERRED',
  UNVERIFIED: 'UNVERIFIED',
  UNAVAILABLE: 'UNAVAILABLE'
});

function normalize(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  return value;
}

function metric({
  id,
  label,
  value,
  state = STATES.UNVERIFIED,
  source = null,
  note = null
}) {
  return {
    id,
    label,
    value: normalize(value),
    state,
    source,
    note,
    observedAt:
      new Date().toISOString()
  };
}

function buildProductionTruth({
  stats = null,
  eons = null,
  models = null,
  abijah = null
} = {}) {
  const availableModels =
    Array.isArray(models?.models)
      ? models.models.length
      : Array.isArray(models?.available)
        ? models.available.length
        : null;

  const entities =
    eons?.entities ??
    eons?.stats?.entities ??
    stats?.entities ??
    null;

  const relations =
    eons?.relations ??
    eons?.stats?.relations ??
    stats?.relations ??
    null;

  const capabilities =
    abijah?.abijah?.capabilities
      ? Object.keys(
          abijah.abijah.capabilities
        ).filter(
          key =>
            abijah.abijah.capabilities[key]
        ).length
      : null;

  return {
    success: true,

    system:
      'CIWU OMNI / EONS',

    milestone:
      'M5.4',

    generatedAt:
      new Date().toISOString(),

    policy: {
      verifiedMeans:
        'Observed from a live application or configured service endpoint.',
      simulatedMeans:
        'Software simulation or conceptual model; not physical quantum hardware or clinical validation.',
      researchMeans:
        'Research-oriented capability or hypothesis; not a deployed medical treatment.',
      unavailableMeans:
        'No trustworthy live value is currently available.'
    },

    metrics: [
      metric({
        id: 'models',
        label: 'Configured models',
        value: availableModels,
        state:
          availableModels === null
            ? STATES.UNAVAILABLE
            : STATES.VERIFIED,
        source:
          '/api/eons-models/available'
      }),

      metric({
        id: 'entities',
        label: 'Knowledge entities',
        value: entities,
        state:
          Number.isFinite(
            Number(entities)
          )
            ? STATES.VERIFIED
            : STATES.UNAVAILABLE,
        source:
          '/api/eons/status'
      }),

      metric({
        id: 'relations',
        label: 'Knowledge relations',
        value: relations,
        state:
          Number.isFinite(
            Number(relations)
          )
            ? STATES.VERIFIED
            : STATES.UNAVAILABLE,
        source:
          '/api/eons/status'
      }),

      metric({
        id: 'abijahCapabilities',
        label: 'Abijah capabilities',
        value: capabilities,
        state:
          capabilities === null
            ? STATES.UNAVAILABLE
            : STATES.VERIFIED,
        source:
          '/api/abijah/status'
      }),

      metric({
        id: 'quantumHardware',
        label: 'Physical quantum hardware',
        value: null,
        state:
          STATES.UNAVAILABLE,
        note:
          'No physical quantum processor has been verified by this application.'
      }),

      metric({
        id: 'blockchainLedger',
        label: 'Production medical blockchain ledger',
        value: null,
        state:
          STATES.UNVERIFIED,
        note:
          'Do not display as active unless an actual configured ledger service is verified.'
      }),

      metric({
        id: 'geneTherapy',
        label: 'Gene therapy capability',
        value: null,
        state:
          STATES.RESEARCH,
        note:
          'Research subject only; not an active treatment capability.'
      }),

      metric({
        id: 'regenerativeMedicine',
        label: 'Regenerative medicine capability',
        value: null,
        state:
          STATES.RESEARCH,
        note:
          'Research/educational domain only.'
      })
    ]
  };
}

module.exports = {
  STATES,
  buildProductionTruth
};
