'use strict';

const REQUIRED_METHODS =
  Object.freeze([
    'id',
    'configured',
    'discoverModels',
    'prepareProbe',
    'executeProbe',
    'classifyFailure'
  ]);

function validate(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    return {
      valid: false,
      reason: 'ADAPTER_REQUIRED'
    };
  }

  for (const name of REQUIRED_METHODS) {
    if (name === 'id') {
      if (
        typeof adapter.id !== 'string' ||
        adapter.id.trim() === ''
      ) {
        return {
          valid: false,
          reason: 'ADAPTER_ID_INVALID'
        };
      }

      continue;
    }

    if (typeof adapter[name] !== 'function') {
      return {
        valid: false,
        reason:
          `ADAPTER_METHOD_MISSING:${name}`
      };
    }
  }

  return {
    valid: true,
    reason: 'ADAPTER_CONTRACT_VALID'
  };
}

function capabilities(adapter) {
  const validation =
    validate(adapter);

  if (!validation.valid) {
    return {
      valid: false,
      capabilities: []
    };
  }

  return {
    valid: true,
    capabilities: [
      'CONFIGURATION_TRUTH',
      'MODEL_DISCOVERY',
      'CERTIFICATION_PROBE_PREPARATION',
      'CERTIFICATION_PROBE_EXECUTION',
      'FAILURE_CLASSIFICATION'
    ]
  };
}

module.exports = {
  REQUIRED_METHODS,
  validate,
  capabilities
};
