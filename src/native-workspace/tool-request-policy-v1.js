'use strict';

const {
  operation
} = require('./workspace-contract-v1');

function classify(requests = []) {
  if (!Array.isArray(requests)) {
    throw new Error('INVALID_TOOL_REQUESTS');
  }

  return requests.map((request, index) => {
    const action =
      request && typeof request.action === 'string'
        ? request.action
        : '';

    const spec = operation(action);

    if (!spec) {
      return {
        index,
        action,
        accepted: false,
        reason: 'UNKNOWN_OPERATION'
      };
    }

    return {
      index,
      action,
      accepted: true,
      authority: spec.authority,
      mutates: spec.mutates,
      execution_status: 'PENDING_EXPLICIT_AUTHORIZATION'
    };
  });
}

module.exports = {
  classify
};
