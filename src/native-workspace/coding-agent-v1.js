'use strict';

const { operation } = require('./workspace-contract-v1');
const { authorize } = require('./authority-v1');

function plan(actions = [], grants = []) {
  const result = [];

  for (const name of actions) {
    const spec = operation(name);

    if (!spec) {
      result.push({
        action: name,
        ok: false,
        reason: 'UNKNOWN_OPERATION'
      });
      continue;
    }

    const auth = authorize(spec.authority, grants);

    result.push({
      action: name,
      authority: spec.authority,
      mutates: spec.mutates,
      ok: auth.ok,
      reason: auth.reason
    });
  }

  return result;
}

module.exports = {
  plan
};
