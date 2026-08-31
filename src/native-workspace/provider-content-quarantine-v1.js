'use strict';

const crypto =
  require('node:crypto');

const DEFAULT_LIMITS =
  Object.freeze({
    max_chars:131072,
    max_bytes:262144,
    max_provider_chars:256
  });

function codedError(code) {
  const error =
    new Error(code);

  error.code = code;

  return error;
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function normalizeLimits(input = {}) {
  const limits = {
    ...DEFAULT_LIMITS,
    ...input
  };

  for (
    const key of
    [
      'max_chars',
      'max_bytes',
      'max_provider_chars'
    ]
  ) {
    if (
      !Number.isSafeInteger(limits[key]) ||
      limits[key] < 1
    ) {
      throw codedError(
        'PROVIDER_QUARANTINE_LIMIT_INVALID'
      );
    }
  }

  return limits;
}

function quarantineProviderContent({
  provider,
  content,
  limits
}) {
  const policy =
    normalizeLimits(limits);

  if (
    typeof provider !== 'string' ||
    !provider.trim()
  ) {
    throw codedError(
      'PROVIDER_QUARANTINE_PROVIDER_REQUIRED'
    );
  }

  const providerName =
    provider.trim();

  if (
    providerName.length >
    policy.max_provider_chars
  ) {
    throw codedError(
      'PROVIDER_QUARANTINE_PROVIDER_TOO_LARGE'
    );
  }

  if (
    typeof content !== 'string'
  ) {
    throw codedError(
      'PROVIDER_QUARANTINE_CONTENT_NOT_STRING'
    );
  }

  if (
    content.length >
    policy.max_chars
  ) {
    throw codedError(
      'PROVIDER_QUARANTINE_MAX_CHARS_EXCEEDED'
    );
  }

  const byteLength =
    Buffer.byteLength(
      content,
      'utf8'
    );

  if (
    byteLength >
    policy.max_bytes
  ) {
    throw codedError(
      'PROVIDER_QUARANTINE_MAX_BYTES_EXCEEDED'
    );
  }

  const contentSha256 =
    sha256(content);

  const bindingSha256 =
    sha256(
      [
        'CIWU_PROVIDER_QUARANTINE_V1',
        providerName,
        contentSha256,
        String(content.length),
        String(byteLength)
      ].join('\n')
    );

  return Object.freeze({
    version:1,

    state:
      'QUARANTINED',

    provider:
      providerName,

    content,

    content_sha256:
      contentSha256,

    quarantine_binding_sha256:
      bindingSha256,

    content_classification:
      'UNTRUSTED_PROVIDER_CONTENT',

    authority_classification:
      'NON_AUTHORITATIVE',

    context_admission_eligible:
      true,

    provider_content_is_instruction:
      false,

    authoritative_for_intent:
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

    network_authority:
      false,

    byte_length:
      byteLength,

    char_length:
      content.length
  });
}

module.exports = {
  DEFAULT_LIMITS,
  quarantineProviderContent
};
