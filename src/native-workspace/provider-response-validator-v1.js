'use strict';

const crypto =
  require('node:crypto');

function errorWith(
  code,
  retryable = false
) {
  const error =
    new Error(code);

  error.code = code;
  error.retryable =
    retryable === true;

  return error;
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function isPlainObject(value) {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return false;
  }

  const proto =
    Object.getPrototypeOf(value);

  return (
    proto === Object.prototype ||
    proto === null
  );
}

function stableNormalize(value) {
  if (Array.isArray(value)) {
    return value.map(
      stableNormalize
    );
  }

  if (isPlainObject(value)) {
    const out = {};

    for (
      const key of
      Object.keys(value).sort()
    ) {
      out[key] =
        stableNormalize(value[key]);
    }

    return out;
  }

  return value;
}

function stableStringify(value) {
  return JSON.stringify(
    stableNormalize(value)
  );
}

const DEFAULT_LIMITS =
  Object.freeze({
    max_bytes:262144,
    max_depth:16,
    max_nodes:4096,
    max_array_items:1024,
    max_string_chars:131072
  });

const FORBIDDEN_KEYS =
  new Set([
    '__proto__',
    'prototype'
  ]);

const AUTHORITY_TRUE_KEYS =
  new Set([
    'operational_authority',
    'tool_authority',
    'tool_execution_allowed',
    'mutation_authority',
    'write_authority',
    'execute_authority',
    'commit_authority',
    'push_authority',
    'deploy_authority',
    'network_authority',
    'network_execution_allowed',
    'order_submission_authority',
    'broker_mutation_authority',
    'live_execution_authority'
  ]);

function inspectValue(
  value,
  state,
  depth,
  limits
) {
  if (depth > limits.max_depth) {
    throw errorWith(
      'PROVIDER_RESPONSE_MAX_DEPTH_EXCEEDED'
    );
  }

  state.nodes += 1;

  if (state.nodes > limits.max_nodes) {
    throw errorWith(
      'PROVIDER_RESPONSE_MAX_NODES_EXCEEDED'
    );
  }

  if (
    value === null ||
    typeof value === 'boolean'
  ) {
    return;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw errorWith(
        'PROVIDER_RESPONSE_NONFINITE_NUMBER'
      );
    }

    return;
  }

  if (typeof value === 'string') {
    if (
      value.length >
      limits.max_string_chars
    ) {
      throw errorWith(
        'PROVIDER_RESPONSE_STRING_LIMIT_EXCEEDED'
      );
    }

    return;
  }

  if (Array.isArray(value)) {
    if (
      value.length >
      limits.max_array_items
    ) {
      throw errorWith(
        'PROVIDER_RESPONSE_ARRAY_LIMIT_EXCEEDED'
      );
    }

    for (const item of value) {
      inspectValue(
        item,
        state,
        depth + 1,
        limits
      );
    }

    return;
  }

  if (!isPlainObject(value)) {
    throw errorWith(
      'PROVIDER_RESPONSE_NON_JSON_VALUE'
    );
  }

  for (
    const [key, child]
    of Object.entries(value)
  ) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw errorWith(
        'PROVIDER_RESPONSE_FORBIDDEN_KEY'
      );
    }

    /*
     * Provider content may describe denied
     * authority, but may never assert/grant
     * operational authority.
     */
    if (
      AUTHORITY_TRUE_KEYS.has(key) &&
      child === true
    ) {
      throw errorWith(
        'PROVIDER_RESPONSE_AUTHORITY_ESCALATION'
      );
    }

    inspectValue(
      child,
      state,
      depth + 1,
      limits
    );
  }
}

function validateProviderResponse({
  provider,
  response,
  requestBindingSha256,
  dispatchId,
  attemptId = null,
  idempotencyKey = null,
  limits = {}
} = {}) {

  if (
    !provider ||
    typeof provider !== 'string'
  ) {
    throw errorWith(
      'PROVIDER_RESPONSE_PROVIDER_REQUIRED'
    );
  }

  if (
    typeof requestBindingSha256
      !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(
      requestBindingSha256
    )
  ) {
    throw errorWith(
      'PROVIDER_RESPONSE_REQUEST_BINDING_INVALID'
    );
  }

  if (
    typeof dispatchId !== 'string' ||
    dispatchId.length < 16
  ) {
    throw errorWith(
      'PROVIDER_RESPONSE_DISPATCH_ID_INVALID'
    );
  }

  if (!isPlainObject(response)) {
    throw errorWith(
      'PROVIDER_RESPONSE_ROOT_INVALID'
    );
  }

  const effectiveLimits = {
    ...DEFAULT_LIMITS,
    ...limits
  };

  const state = {
    nodes:0
  };

  inspectValue(
    response,
    state,
    0,
    effectiveLimits
  );

  let serialized;

  try {
    serialized =
      stableStringify(response);
  } catch {
    throw errorWith(
      'PROVIDER_RESPONSE_SERIALIZATION_FAILED'
    );
  }

  const bytes =
    Buffer.byteLength(
      serialized,
      'utf8'
    );

  if (
    bytes >
    effectiveLimits.max_bytes
  ) {
    throw errorWith(
      'PROVIDER_RESPONSE_MAX_BYTES_EXCEEDED'
    );
  }

  const responseSha256 =
    sha256(serialized);

  const provenanceCore = {
    provider,
    dispatch_id:
      dispatchId,
    attempt_id:
      attemptId,
    idempotency_key:
      idempotencyKey,
    request_binding_sha256:
      requestBindingSha256,
    provider_response_sha256:
      responseSha256
  };

  const provenanceSha256 =
    sha256(
      stableStringify(
        provenanceCore
      )
    );

  return {
    response,
    validation:{
      schema_version:1,

      state:
        'VALIDATED',

      content_classification:
        'UNTRUSTED_PROVIDER_CONTENT',

      authority_classification:
        'NON_AUTHORITATIVE',

      provider,

      request_binding_sha256:
        requestBindingSha256,

      provider_response_sha256:
        responseSha256,

      provenance_sha256:
        provenanceSha256,

      dispatch_id:
        dispatchId,

      attempt_id:
        attemptId,

      idempotency_key:
        idempotencyKey,

      structural_validation:
        true,

      json_safe:
        true,

      size_validation:
        true,

      depth_validation:
        true,

      node_validation:
        true,

      authority_escalation:
        false,

      operational_authority:
        false,

      tool_execution_allowed:
        false,

      mutation_authority:
        false,

      write_authority:
        false,

      execute_authority:
        false,

      commit_authority:
        false,

      push_authority:
        false,

      deploy_authority:
        false,

      provider_content_is_instruction:
        false,

      downstream_trust:
        false,

      network_authority:
        false
    }
  };
}

module.exports = {
  DEFAULT_LIMITS,
  stableStringify,
  validateProviderResponse
};
