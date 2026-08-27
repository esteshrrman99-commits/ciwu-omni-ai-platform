'use strict';

function classifyTruth(value) {
  if (value === undefined || value === null)
    return 'UNKNOWN';

  if (value === true) return 'TRUE';
  if (value === false) return 'FALSE';

  return 'OBSERVED';
}

function authorize({
  evidenceValid,
  safetyValid,
  dimensionsValid,
  authorization,
  confidence = 0
}) {
  const gates = {
    evidence: evidenceValid === true,
    safety: safetyValid === true,
    dimensions: dimensionsValid === true,
    authorization: authorization === true
  };

  const pass = Object.values(gates).every(Boolean);

  return {
    decision: pass ? 'AUTHORIZED' : 'ABSTAIN',
    gates,
    confidence,
    invariants: {
      unknownIsNotZero: true,
      missingIsNotSafe: true,
      confidenceIsNotTruth: true,
      optimizationIsNotAuthorization: true
    }
  };
}

module.exports = {
  classifyTruth,
  authorize
};
