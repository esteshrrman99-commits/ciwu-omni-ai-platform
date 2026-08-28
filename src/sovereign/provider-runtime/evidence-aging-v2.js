'use strict';

function toMs(value) {
  const ms =
    new Date(value).getTime();

  if (!Number.isFinite(ms)) {
    throw new Error(
      'INVALID_EVIDENCE_TIMESTAMP'
    );
  }

  return ms;
}

function assess({
  issuedAt,
  now = new Date().toISOString(),
  ttlMs
}) {
  const issued =
    toMs(issuedAt);

  const current =
    toMs(now);

  const ttl =
    Number(ttlMs);

  if (
    !Number.isFinite(ttl) ||
    ttl <= 0
  ) {
    throw new Error(
      'INVALID_EVIDENCE_TTL'
    );
  }

  if (current < issued) {
    return {
      valid: false,
      stale: true,
      reason:
        'EVIDENCE_FROM_FUTURE',
      ageMs: 0,
      remainingMs: 0
    };
  }

  const age =
    current - issued;

  const stale =
    age >= ttl;

  return {
    valid:
      !stale,

    stale,

    reason:
      stale
        ? 'EVIDENCE_EXPIRED'
        : 'EVIDENCE_FRESH',

    ageMs:
      age,

    remainingMs:
      stale
        ? 0
        : ttl - age
  };
}

function requireFresh(input) {
  const result =
    assess(input);

  if (!result.valid) {
    throw new Error(
      result.reason
    );
  }

  return result;
}

module.exports = {
  toMs,
  assess,
  requireFresh
};
