'use strict';

function createRegistry() {
  const entries =
    new Map();

  function key(
    provider,
    model
  ) {
    return (
      `${provider}::${model}`
    );
  }

  function admit(entry) {
    if (
      entry?.admitted !== true
    ) {
      throw new Error(
        'RUNTIME_ADMISSION_REQUIRED'
      );
    }

    if (!entry.provider)
      throw new Error(
        'PROVIDER_REQUIRED'
      );

    if (!entry.model)
      throw new Error(
        'MODEL_REQUIRED'
      );

    if (!entry.evidenceHash)
      throw new Error(
        'EVIDENCE_HASH_REQUIRED'
      );

    const k =
      key(
        entry.provider,
        entry.model
      );

    entries.set(
      k,
      {
        ...entry,

        runtimeEligible:
          true,

        admittedAt:
          entry.admittedAt ||
          new Date()
            .toISOString()
      }
    );

    return entries.get(k);
  }

  function revoke(
    provider,
    model,
    reason
  ) {
    const k =
      key(
        provider,
        model
      );

    const current =
      entries.get(k);

    if (!current)
      return null;

    const revoked = {
      ...current,

      runtimeEligible:
        false,

      revocationReason:
        reason ||
        'UNSPECIFIED',

      revokedAt:
        new Date()
          .toISOString()
    };

    entries.set(
      k,
      revoked
    );

    return revoked;
  }

  function get(
    provider,
    model
  ) {
    return (
      entries.get(
        key(provider,model)
      ) ||
      null
    );
  }

  function eligible() {
    return [...entries.values()]
      .filter(
        entry =>
          entry.runtimeEligible ===
          true
      );
  }

  return {
    admit,
    revoke,
    get,
    eligible
  };
}

module.exports = {
  createRegistry
};
