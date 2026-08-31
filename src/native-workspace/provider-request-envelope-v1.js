'use strict';

const crypto =
  require('node:crypto');

function stable(value) {
  if (Array.isArray(value)) {
    return '[' +
      value.map(stable)
        .join(',') +
      ']';
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return '{' +
      Object.keys(value)
        .sort()
        .map(
          key =>
            JSON.stringify(key) +
            ':' +
            stable(value[key])
        )
        .join(',') +
      '}';
  }

  return JSON.stringify(value);
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value ===
        'string'
        ? value
        : stable(value)
    )
    .digest('hex');
}

function buildProviderRequest({
  route,
  contextEnvelope,
  metadata = {},
  clock =
    () =>
      new Date()
        .toISOString()
}) {
  if (
    !route ||
    route.network_allowed !==
      false
  ) {
    throw new Error(
      'PROVIDER_REQUEST_ROUTE_INVALID'
    );
  }

  if (
    !contextEnvelope ||
    !contextEnvelope.current ||
    !contextEnvelope.model_authority
  ) {
    throw new Error(
      'PROVIDER_REQUEST_CONTEXT_INVALID'
    );
  }

  const request = {
    version:1,
    mode:'DRY_RUN',
    created_at:
      clock(),
    provider:
      route.provider,
    model:
      route.model,
    routing_mode:
      route.routing_mode,
    network_allowed:false,
    context_envelope:
      contextEnvelope,
    metadata,
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

  const request_sha256 =
    sha256(request);

  return {
    ...request,
    request_sha256
  };
}

module.exports = {
  stable,
  sha256,
  buildProviderRequest
};
