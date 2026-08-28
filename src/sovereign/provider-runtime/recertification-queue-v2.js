'use strict';

function create() {
  const queue=[];

  function enqueue({
    provider,
    model,
    reason,
    evidenceHash
  }) {
    if (!provider || !model)
      throw new Error(
        'PROVIDER_MODEL_REQUIRED'
      );

    const existing =
      queue.find(
        x =>
          x.provider === provider &&
          x.model === model &&
          x.state === 'PENDING'
      );

    if (existing)
      return existing;

    const item={
      id:
        `${provider}:${model}:${Date.now()}`,

      provider,
      model,
      reason:
        reason || 'UNKNOWN',

      evidenceHash:
        evidenceHash || null,

      state:'PENDING',

      createdAt:
        new Date().toISOString()
    };

    queue.push(item);

    return item;
  }

  function resolve(
    id,
    result
  ) {
    const item=
      queue.find(
        x => x.id === id
      );

    if (!item)
      throw new Error(
        'RECERTIFICATION_ITEM_NOT_FOUND'
      );

    if (item.state !== 'PENDING')
      throw new Error(
        'RECERTIFICATION_ALREADY_RESOLVED'
      );

    item.state =
      result === true
        ? 'CERTIFIED'
        : 'REJECTED';

    item.resolvedAt =
      new Date().toISOString();

    return item;
  }

  function snapshot() {
    return queue.map(
      x => ({...x})
    );
  }

  return {
    enqueue,
    resolve,
    snapshot
  };
}

module.exports = {
  create
};
