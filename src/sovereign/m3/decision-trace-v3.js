'use strict';

function create({
  requestId,
  taskClass,
  candidates = []
}) {
  if (!requestId) {
    throw new Error(
      'REQUEST_ID_REQUIRED'
    );
  }

  const events = [];

  function record({
    type,
    detail
  }) {
    if (!type) {
      throw new Error(
        'TRACE_EVENT_TYPE_REQUIRED'
      );
    }

    events.push({
      sequence:
        events.length + 1,

      type,
      detail:
        detail ?? null,

      at:
        new Date().toISOString()
    });

    return events[
      events.length - 1
    ];
  }

  function finish({
    selectedProvider = null,
    selectedModel = null,
    abstained = false,
    reason = null
  } = {}) {
    return {
      schema:
        'CIWU_M3_DECISION_TRACE_V3',

      requestId,
      taskClass,

      candidateCount:
        candidates.length,

      candidates:
        candidates.map(
          candidate => ({
            provider:
              candidate.provider,

            model:
              candidate.model
          })
        ),

      selectedProvider:
        abstained
          ? null
          : selectedProvider,

      selectedModel:
        abstained
          ? null
          : selectedModel,

      abstained:
        abstained === true,

      reason,

      events:
        events.map(
          event => ({
            ...event
          })
        )
    };
  }

  return {
    record,
    finish
  };
}

module.exports = {
  create
};
