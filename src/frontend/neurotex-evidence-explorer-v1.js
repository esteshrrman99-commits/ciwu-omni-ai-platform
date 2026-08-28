'use strict';

function normalize(record={}) {
  const confidence=Number(record.confidence);

  let state='REJECTED';

  if (
    record.revoked === true
  ) {
    state='REVOKED';
  } else if (
    Number.isFinite(confidence) &&
    confidence >= 0.65
  ) {
    state='ACTIVE';
  } else if (
    Number.isFinite(confidence) &&
    confidence >= 0.25
  ) {
    state='QUARANTINED';
  }

  return {
    id:String(record.id || 'UNKNOWN'),
    claim:String(record.claim || ''),
    source:String(record.source || 'UNKNOWN'),
    evidenceHash:
      record.evidenceHash || null,
    confidence:
      Number.isFinite(confidence)
        ? Math.max(0,Math.min(1,confidence))
        : null,
    provenanceValid:
      record.provenanceValid === true,
    regressionValid:
      record.regressionValid === true,
    revoked:
      record.revoked === true,
    state
  };
}

function filter(records=[], state=null) {
  const normalized=records.map(normalize);

  if (!state)
    return normalized;

  return normalized.filter(
    item => item.state === state
  );
}

module.exports={
  normalize,
  filter
};
