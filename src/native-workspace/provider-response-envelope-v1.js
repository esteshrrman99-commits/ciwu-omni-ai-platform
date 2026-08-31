'use strict';

const crypto =
  require('node:crypto');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      String(value || '')
    )
    .digest('hex');
}

function buildDryRunResponse({
  requestEnvelope,
  clock =
    () =>
      new Date()
        .toISOString()
}) {
  if (
    !requestEnvelope ||
    requestEnvelope.mode !==
      'DRY_RUN' ||
    requestEnvelope.network_allowed !==
      false
  ) {
    throw new Error(
      'DRY_RUN_REQUEST_INVALID'
    );
  }

  const text =
    'CIWU provider dry-run completed. ' +
    'No external model network call was performed.';

  return {
    version:1,
    mode:'DRY_RUN_RESPONSE',
    created_at:
      clock(),
    provider:
      requestEnvelope.provider,
    model:
      requestEnvelope.model,
    request_sha256:
      requestEnvelope
        .request_sha256,
    response_text:text,
    response_sha256:
      sha256(text),
    provenance:{
      generated_by:
        'CIWU_LOCAL_DRY_RUN_SIMULATOR',
      external_provider_called:false,
      real_model_response:false
    },
    authority:{
      operational_authority:false,
      tool_execution_allowed:false,
      mutation_authority:false,
      write_authority:false,
      execute_authority:false,
      commit_authority:false,
      push_authority:false,
      deploy_authority:false
    }
  };
}

module.exports = {
  buildDryRunResponse
};
