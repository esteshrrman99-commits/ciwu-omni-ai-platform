'use strict';

const {
  complete
} = require('./provider-bridge-v1');

const {
  createProviderContextContinuity
} = require('./provider-context-continuity-v1');

function codedError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function assertAdmission(admission) {
  if (
    !admission ||
    admission.state !== 'CONTEXT_ADMITTED' ||
    admission.context_class !== 'NON_AUTHORITATIVE_CONTEXT' ||
    admission.authoritative_for_intent !== false ||
    admission.operational_authority !== false ||
    admission.tool_execution_allowed !== false ||
    admission.mutation_authority !== false ||
    admission.write_authority !== false ||
    admission.execute_authority !== false ||
    admission.commit_authority !== false ||
    admission.push_authority !== false ||
    admission.deploy_authority !== false ||
    admission.network_authority !== false
  ) {
    throw codedError(
      'PROVIDER_CONTEXT_NOT_SAFE_FOR_PERSISTENCE'
    );
  }
}

async function completeAndPersist({
  registry,
  providerName,
  request,
  stateRoot,
  clock
}) {
  if (!registry) {
    throw codedError('PROVIDER_REGISTRY_REQUIRED');
  }

  if (
    typeof providerName !== 'string' ||
    !providerName.trim()
  ) {
    throw codedError('PROVIDER_NAME_REQUIRED');
  }

  if (
    typeof stateRoot !== 'string' ||
    !stateRoot.trim()
  ) {
    throw codedError('STATE_ROOT_REQUIRED');
  }

  const result =
    await complete(
      registry,
      providerName,
      request
    );

  if (!result || result.ok !== true) {
    return {
      ...result,
      persistence: {
        state: 'NOT_PERSISTED',
        reason:
          result && result.reason
            ? result.reason
            : 'PROVIDER_COMPLETION_FAILED'
      }
    };
  }

  if (typeof result.content !== 'string') {
    throw codedError(
      'ADMITTED_PROVIDER_CONTENT_REQUIRED'
    );
  }

  assertAdmission(
    result.context_admission
  );

  const continuity =
    createProviderContextContinuity({
      stateRoot,
      clock
    });

  /*
   * Leap021 continuity remains the sole persistence authority.
   * Provider text is DATA, never operational instruction.
   *
   * Preserve the admitted bridge payload and provenance as one
   * non-authoritative persistence request. The continuity layer
   * remains responsible for validating its own schema/hash chain.
   */
  const persistenceInput = {
    provider: providerName,

    contextClass:
      'NON_AUTHORITATIVE_CONTEXT',

    authoritativeForIntent: false,

    content: result.content,

    contentHash:
      result.context_admission.content_sha256,

    provenance: {
      source: 'provider-response',
      provider: providerName,
      validated: true,
      admitted: true,

      sourceClass:
        'UNTRUSTED_PROVIDER_CONTENT',

      quarantineBindingSha256:
        result.context_admission
          .quarantine_binding_sha256,

      contextAdmissionSha256:
        result.context_admission
          .context_admission_sha256
    },

    authority: {
      operational: false,
      tool: false,
      write: false,
      execute: false,
      commit: false,
      push: false,
      deploy: false,
      network: false
    }
  };

  let persisted;

  try {
    persisted =
      continuity.persistAdmittedContext(
        persistenceInput
      );
  } catch (error) {
    return {
      ok: false,
      provider: providerName,
      content: null,
      tool_requests: [],
      usage: null,
      context_admission:
        result.context_admission,
      persistence: {
        state: 'PERSISTENCE_DENIED',
        reason:
          error && error.code
            ? error.code
            : (
                error &&
                error.message
                  ? error.message
                  : 'PERSISTENCE_FAILED'
              )
      }
    };
  }

  return {
    ...result,
    persistence: {
      state: 'PERSISTED_NON_AUTHORITATIVE_CONTEXT',
      result: persisted
    },
    authority: {
      operational: false,
      tool: false,
      mutation: false,
      write: false,
      execute: false,
      commit: false,
      push: false,
      deploy: false
    }
  };
}

module.exports = {
  completeAndPersist
};
