'use strict';

/*
 * CIWU NEUROTEX EVIDENCE WEIGHTING V6
 *
 * Invariants:
 *   NaN / UNKNOWN => 0, never trusted.
 *   ACTIVE       : score >= promote threshold.
 *   QUARANTINED  : quarantine threshold <= score < promote threshold.
 *   REJECTED     : score < quarantine threshold.
 */

function clamp01(value) {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(numeric)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      numeric
    )
  );
}

function weight({
  confidence,
  provenance,
  regression,
  freshness,
  sourceIndependence,
  contradictionRisk
}) {
  const c =
    clamp01(confidence);

  const p =
    clamp01(provenance);

  const r =
    clamp01(regression);

  const f =
    clamp01(freshness);

  const s =
    clamp01(sourceIndependence);

  const contradiction =
    clamp01(
      contradictionRisk
    );

  const positive =
    c *
    p *
    r *
    f *
    s;

  return clamp01(
    positive *
    (1 - contradiction)
  );
}

function decide({
  evidenceWeight,
  promoteThreshold = 0.65,
  quarantineThreshold = 0.25
} = {}) {
  const value =
    clamp01(
      evidenceWeight
    );

  const promote =
    clamp01(
      promoteThreshold
    );

  const quarantine =
    clamp01(
      quarantineThreshold
    );

  if (
    quarantine >
    promote
  ) {
    throw new Error(
      'NEUROTEX_THRESHOLD_ORDER_INVALID'
    );
  }

  if (
    value >= promote
  ) {
    return 'ACTIVE';
  }

  if (
    value >= quarantine
  ) {
    return 'QUARANTINED';
  }

  return 'REJECTED';
}

/*
 * Backward-compatible scalar API.
 * Existing M1105-M1224 tests call decide(0.9).
 */
function decideCompat(
  input,
  promoteThreshold = 0.65,
  quarantineThreshold = 0.25
) {
  if (
    typeof input === 'object' &&
    input !== null
  ) {
    return decide(input);
  }

  return decide({
    evidenceWeight:
      input,

    promoteThreshold,
    quarantineThreshold
  });
}

module.exports = {
  clamp01,
  weight,
  decide:
    decideCompat
};
