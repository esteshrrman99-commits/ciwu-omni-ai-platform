'use strict';

const crypto=require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function create({
  gapRegistry,
  loopResult,
  evaluation
}={}) {
  if (!gapRegistry || !loopResult || !evaluation) {
    throw new Error('INTELLIGENCE_ENVELOPE_INPUT_MISSING');
  }

  const body={
    schema:'CIWU_CORTEX_INTELLIGENCE_ENVELOPE_V1',
    gapRegistryHash:gapRegistry.registryHash,
    loopStatus:loopResult.status,
    loopIterations:loopResult.iterations,
    evaluation,
    confidenceIsTruth:false,
    optimizationIsAuthorization:false,
    unknownIsZero:false,
    missingIsSafe:false,
    productionMutation:false
  };

  return Object.freeze({
    ...body,
    evidenceHash:hash(body)
  });
}

module.exports={
  hash,
  create
};
