/*
 * EONS OMNIMODEL REGISTRY
 *
 * This registry is intentionally provider-neutral.
 *
 * IMPORTANT:
 * - Only real, configured model IDs should be activated.
 * - Future/unreleased models are represented as placeholders.
 * - The system does NOT pretend that unpublished models are available.
 */

module.exports = {

  architecture: {
    name: "EONS OMNIMODEL FRONTIER",
    version: "1.0.0",
    routing: "adaptive",
    fallback: true,
    healthChecks: true,
    telemetry: true
  },

  providers: {

    openai: {
      enabled: true,
      environmentKey: "OPENAI_API_KEY",

      models: [
        {
          id: "gpt-4o-mini",
          role: ["chat", "fast", "reasoning"],
          enabled: true
        },

        /*
         * Add currently available OpenAI models here
         * after verifying the exact model ID in your account/API.
         */
      ]
    },

    anthropic: {
      enabled: false,
      environmentKey: "ANTHROPIC_API_KEY",

      models: [
        /*
         * Add verified Anthropic model IDs here.
         */
      ]
    },

    google: {
      enabled: false,
      environmentKey: "GOOGLE_API_KEY",

      models: [
        /*
         * Add verified Gemini model IDs here.
         */
      ]
    },

    mistral: {
      enabled: false,
      environmentKey: "MISTRAL_API_KEY",

      models: []
    },

    groq: {
      enabled: false,
      environmentKey: "GROQ_API_KEY",

      models: []
    },

    xai: {
      enabled: false,
      environmentKey: "XAI_API_KEY",

      models: []
    },

    local: {
      enabled: false,
      models: [
        /*
         * Local models can be registered here later.
         */
      ]
    }
  },

  capabilityLayers: {

    perception: [
      "vision",
      "image-understanding",
      "document-understanding",
      "audio-understanding",
      "video-understanding"
    ],

    cognition: [
      "reasoning",
      "planning",
      "classification",
      "summarization",
      "research",
      "coding"
    ],

    generation: [
      "text-generation",
      "structured-output",
      "code-generation",
      "creative-generation"
    ],

    tools: [
      "web-search",
      "retrieval",
      "database",
      "filesystem",
      "function-calling"
    ],

    orchestration: [
      "model-routing",
      "fallback-routing",
      "ensemble-routing",
      "task-decomposition",
      "verification"
    ]
  },

  futureSlots: {

    /*
     * These are architectural placeholders, NOT claims that
     * these models currently exist or are publicly downloadable.
     */

    frontier_2027: {
      status: "reserved"
    },

    frontier_2028: {
      status: "reserved"
    },

    frontier_2029_plus: {
      status: "reserved"
    },

    unknown_future_models: {
      status: "dynamic-discovery-only"
    }
  }
};
