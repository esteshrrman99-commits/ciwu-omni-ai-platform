'use strict';

function exists(name) {
  return typeof process.env[name] === 'string' &&
         process.env[name].trim().length > 0;
}

function providerEnvironment() {
  return {
    groq: {
      configured: exists('GROQ_API_KEY'),
      modelConfigured: exists('GROQ_MODEL')
    },

    gemini: {
      configured:
        exists('GEMINI_API_KEY') ||
        exists('GOOGLE_API_KEY'),
      modelConfigured:
        exists('GEMINI_MODEL')
    },

    cloudflare: {
      configured:
        exists('CLOUDFLARE_API_TOKEN') &&
        exists('CLOUDFLARE_ACCOUNT_ID'),
      modelConfigured:
        exists('CLOUDFLARE_MODEL')
    },

    huggingface: {
      configured:
        exists('HF_TOKEN'),
      modelConfigured:
        exists('HF_MODEL')
    },

    openai: {
      configured:
        exists('OPENAI_API_KEY'),
      modelConfigured:
        exists('OPENAI_MODEL')
    },

    local: {
      configured:
        exists('CIWU_LOCAL_MODEL_ENDPOINT'),
      modelConfigured:
        exists('CIWU_LOCAL_MODEL')
    }
  };
}

function publicStatus() {
  const env = providerEnvironment();

  return Object.fromEntries(
    Object.entries(env).map(
      ([provider, state]) => [
        provider,
        {
          configured: state.configured,
          modelConfigured: state.modelConfigured
        }
      ]
    )
  );
}

module.exports = {
  providerEnvironment,
  publicStatus
};
