'use strict';

const ENVIRONMENT = Object.freeze({
  groq: {
    requiredAll: ['GROQ_API_KEY'],
    requiredAny: [],
    model: ['GROQ_MODEL']
  },

  gemini: {
    requiredAll: [],
    requiredAny: [
      'GEMINI_API_KEY',
      'GOOGLE_API_KEY'
    ],
    model: ['GEMINI_MODEL']
  },

  cloudflare: {
    requiredAll: [
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ACCOUNT_ID'
    ],
    requiredAny: [],
    model: ['CLOUDFLARE_MODEL']
  },

  huggingface: {
    requiredAll: ['HF_TOKEN'],
    requiredAny: [],
    model: ['HF_MODEL']
  },

  openai: {
    requiredAll: ['OPENAI_API_KEY'],
    requiredAny: [],
    model: ['OPENAI_MODEL']
  },

  local: {
    requiredAll: [
      'CIWU_LOCAL_MODEL_ENDPOINT'
    ],
    requiredAny: [],
    model: ['CIWU_LOCAL_MODEL']
  }
});

function has(name) {
  return (
    typeof process.env[name] === 'string' &&
    process.env[name].trim().length > 0
  );
}

function configured(spec) {
  const allPass =
    (spec.requiredAll || [])
      .every(has);

  const anyList =
    spec.requiredAny || [];

  const anyPass =
    anyList.length === 0 ||
    anyList.some(has);

  return allPass && anyPass;
}

function providerState(provider) {
  const spec =
    ENVIRONMENT[provider];

  if (!spec) {
    return {
      provider,
      known: false,
      configured: false,
      modelConfigured: false
    };
  }

  return {
    provider,
    known: true,
    configured:
      configured(spec),

    modelConfigured:
      (spec.model || [])
        .some(has)
  };
}

function allStates() {
  return Object
    .keys(ENVIRONMENT)
    .map(providerState);
}

function sanitizeState(state) {
  return {
    provider:
      state.provider,

    known:
      state.known,

    configured:
      state.configured,

    modelConfigured:
      state.modelConfigured
  };
}

module.exports = {
  ENVIRONMENT,
  configured,
  providerState,
  allStates,
  sanitizeState
};
