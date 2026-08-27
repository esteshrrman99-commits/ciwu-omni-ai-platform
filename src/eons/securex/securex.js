'use strict';

class SECUREX {
  validateModel(model = {}) {
    const failures = [];

    if (!model.provider) failures.push('missing_provider');
    if (!model.model_id && !model.id) failures.push('missing_model_id');

    if (
      model.status === 'unknown' ||
      model.status === 'unverified'
    ) {
      failures.push('unverified_model');
    }

    return {
      secure: failures.length === 0,
      failures
    };
  }
}

module.exports = SECUREX;
