'use strict';

const {
  quarantineProviderContent
} = require('./provider-content-quarantine-v1');

const {
  admitProviderContext
} = require('./provider-context-admission-v1');


const {
  assertServerSideProvider
} = require('./secret-boundary-v1');

async function complete(
  registry,
  providerName,
  request
) {
  const provider = registry.get(providerName);

  if (!provider) {
    return {
      ok: false,
      reason: 'PROVIDER_NOT_FOUND'
    };
  }

  if (
    provider.metadata.enabled !== true ||
    provider.metadata.healthy !== true
  ) {
    return {
      ok: false,
      reason: 'PROVIDER_NOT_READY'
    };
  }

  assertServerSideProvider(provider.metadata);

  const result = await provider.adapter.complete(request);

  if (
    !result ||
    typeof result.content !== 'string'
  ) {
    return {
      ok: false,
      reason: 'INVALID_PROVIDER_RESPONSE'
    };
  }

  let admitted;

  try {
    const quarantined =
      quarantineProviderContent({
        provider: providerName,
        content: result.content
      });

    admitted =
      admitProviderContext({
        quarantined
      });
  } catch (error) {
    return {
      ok: false,
      provider: providerName,
      reason:
        error && error.code
          ? error.code
          : 'PROVIDER_CONTEXT_ADMISSION_FAILED',
      content: null,
      tool_requests: [],
      usage: null,
      context_admission: {
        version: 1,
        state: 'CONTEXT_ADMISSION_DENIED',
        authoritative_for_intent: false,
        operational_authority: false,
        tool_execution_allowed: false,
        mutation_authority: false,
        write_authority: false,
        execute_authority: false,
        commit_authority: false,
        push_authority: false,
        deploy_authority: false,
        network_authority: false
      }
    };
  }

  return {
    ok: true,
    provider: providerName,
    content: admitted.content,
    tool_requests: Array.isArray(result.tool_requests)
      ? result.tool_requests
      : [],
    usage: result.usage || null,
    context_admission:
      admitted.admission
  };
}

module.exports = {
  complete
};
