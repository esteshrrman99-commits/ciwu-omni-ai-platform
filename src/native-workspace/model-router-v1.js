'use strict';

const PROVIDERS = Object.freeze({
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
  GOOGLE: 'GOOGLE',
  LOCAL: 'LOCAL'
});

function route(request = {}, providers = {}) {
  if (!request || typeof request !== 'object') {
    return {
      ok: false,
      reason: 'INVALID_REQUEST'
    };
  }

  for (const provider of Object.values(PROVIDERS)) {
    if (providers[provider] &&
        providers[provider].enabled === true &&
        providers[provider].healthy === true) {
      return {
        ok: true,
        provider,
        mode: 'ROUTE_ONLY'
      };
    }
  }

  return {
    ok: false,
    provider: null,
    reason: 'NO_VERIFIED_MODEL_PROVIDER'
  };
}

module.exports = {
  PROVIDERS,
  route
};
