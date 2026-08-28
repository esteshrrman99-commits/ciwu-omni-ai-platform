'use strict';

const adapters = {
  groq:
    require(
      '../federation/adapters/groq'
    ),

  gemini:
    require(
      '../federation/adapters/gemini'
    ),

  cloudflare:
    require(
      '../federation/adapters/cloudflare'
    ),

  huggingface:
    require(
      '../federation/adapters/huggingface'
    ),

  local:
    require(
      '../federation/adapters/local'
    )
};

function get(provider) {
  return adapters[provider] ||
    null;
}

function list() {
  return Object.keys(adapters);
}

module.exports = {
  get,
  list
};
