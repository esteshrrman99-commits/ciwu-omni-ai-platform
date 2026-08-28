'use strict';

const INVARIANTS =
  Object.freeze({
    unknownIsNotZero: true,
    missingIsNotSafe: true,
    confidenceIsNotTruth: true,
    correlationIsNotCausation: true,
    optimizationIsNotAuthorization: true
  });

function mayPromote({
  testsPassed,
  provenancePresent,
  evidenceValid,
  authorizationValid
}) {
  return (
    testsPassed === true &&
    provenancePresent === true &&
    evidenceValid === true &&
    authorizationValid === true
  );
}

module.exports = {
  INVARIANTS,
  mayPromote
};
