'use strict';

const crypto =
  require('node:crypto');

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

function expectedBinding(row) {
  return sha256(
    [
      'CIWU_PROVIDER_QUARANTINE_V1',
      row.provider,
      row.content_sha256,
      String(row.char_length),
      String(row.byte_length)
    ].join('\n')
  );
}

function denyAuthority(row) {
  const forbidden =
    [
      'operational_authority',
      'tool_execution_allowed',
      'mutation_authority',
      'write_authority',
      'execute_authority',
      'commit_authority',
      'push_authority',
      'deploy_authority',
      'network_authority',
      'authoritative_for_intent',
      'provider_content_is_instruction'
    ];

  for (const key of forbidden) {
    if (row[key] !== false) {
      throw codedError(
        'PROVIDER_CONTEXT_AUTHORITY_INVARIANT_FAILED'
      );
    }
  }
}

function admitProviderContext({
  quarantined
}) {
  if (
    !quarantined ||
    typeof quarantined !== 'object'
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_QUARANTINE_REQUIRED'
    );
  }

  if (
    quarantined.state !==
    'QUARANTINED'
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_NOT_QUARANTINED'
    );
  }

  if (
    quarantined
      .content_classification !==
    'UNTRUSTED_PROVIDER_CONTENT'
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_CLASS_INVALID'
    );
  }

  if (
    quarantined
      .authority_classification !==
    'NON_AUTHORITATIVE'
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_AUTHORITY_CLASS_INVALID'
    );
  }

  if (
    quarantined
      .context_admission_eligible !==
    true
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_NOT_ELIGIBLE'
    );
  }

  if (
    typeof quarantined.content !==
    'string'
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_CONTENT_INVALID'
    );
  }

  if (
    sha256(
      quarantined.content
    ) !==
    quarantined.content_sha256
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_CONTENT_HASH_MISMATCH'
    );
  }

  if (
    expectedBinding(
      quarantined
    ) !==
    quarantined
      .quarantine_binding_sha256
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_BINDING_MISMATCH'
    );
  }

  denyAuthority(
    quarantined
  );

  const admissionSha256 =
    sha256(
      [
        'CIWU_PROVIDER_CONTEXT_ADMISSION_V1',
        quarantined.provider,
        quarantined.content_sha256,
        quarantined
          .quarantine_binding_sha256,
        'NON_AUTHORITATIVE_CONTEXT'
      ].join('\n')
    );

  return Object.freeze({
    ok:true,

    content:
      quarantined.content,

    admission:
      Object.freeze({
        version:1,

        state:
          'CONTEXT_ADMITTED',

        promotion:
          'ELIGIBLE_FOR_BOUNDED_CONTEXT_ONLY',

        provider:
          quarantined.provider,

        source_class:
          'UNTRUSTED_PROVIDER_CONTENT',

        context_class:
          'NON_AUTHORITATIVE_CONTEXT',

        trust_level:
          'NON_AUTHORITATIVE',

        content_sha256:
          quarantined.content_sha256,

        quarantine_binding_sha256:
          quarantined
            .quarantine_binding_sha256,

        context_admission_sha256:
          admissionSha256,

        authoritative_for_intent:
          false,

        provider_content_is_instruction:
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
          false
      })
  });
}

module.exports = {
  admitProviderContext
};
