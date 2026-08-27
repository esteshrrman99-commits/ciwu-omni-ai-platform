"use strict";

/*
 * Provider-neutral LLM contract.
 *
 * The orchestration layer does not assume a particular vendor.
 * A provider adapter can later connect OpenAI, Anthropic,
 * local models, or another approved inference service.
 *
 * The LLM proposes.
 * The deterministic system verifies.
 * The policy layer authorizes.
 */

class LLMContract {
  constructor(provider) {
    this.provider = provider || null;
  }

  async analyze(input) {
    if (!this.provider || typeof this.provider.analyze !== "function") {
      return {
        provider: "none",
        mode: "deterministic-fallback",
        proposal: null,
        requiresProvider: true
      };
    }

    return this.provider.analyze(input);
  }

  async review(input) {
    if (!this.provider || typeof this.provider.review !== "function") {
      return {
        provider: "none",
        mode: "deterministic-fallback",
        review: null,
        requiresProvider: true
      };
    }

    return this.provider.review(input);
  }
}

module.exports = {
  LLMContract
};
