'use strict';

function create() {
  const events=[];

  function append({
    provider,
    model,
    state,
    reason=null,
    evidenceHash=null
  }) {
    if (!provider || !model)
      throw new Error(
        'PROVIDER_MODEL_REQUIRED'
      );

    const allowed=
      new Set([
        'UNKNOWN',
        'HEALTHY',
        'DEGRADED',
        'BLOCKED',
        'REVOKED'
      ]);

    if (!allowed.has(state))
      throw new Error(
        'INVALID_HEALTH_STATE'
      );

    const event={
      sequence:events.length+1,
      provider,
      model,
      state,
      reason,
      evidenceHash,
      createdAt:
        new Date().toISOString()
    };

    events.push(event);
    return {...event};
  }

  function latest(provider,model) {
    return [...events]
      .reverse()
      .find(
        x =>
          x.provider === provider &&
          x.model === model
      ) || null;
  }

  function snapshot() {
    return events.map(
      x => ({...x})
    );
  }

  return {
    append,
    latest,
    snapshot
  };
}

module.exports={ create };
