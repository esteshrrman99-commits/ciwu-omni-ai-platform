'use strict';

const path = require('node:path');

const adapters = {
  groq:
    require('../../src/sovereign/federation/adapters/groq'),

  gemini:
    require('../../src/sovereign/federation/adapters/gemini'),

  cloudflare:
    require('../../src/sovereign/federation/adapters/cloudflare'),

  huggingface:
    require('../../src/sovereign/federation/adapters/huggingface'),

  local:
    require('../../src/sovereign/federation/adapters/local')
};

const health =
  require('../../src/sovereign/federation/health');

async function main() {
  const provider =
    process.argv[2];

  if (!provider || !adapters[provider]) {
    console.error(
      'USAGE: node scripts/sovereign/certify-provider.js ' +
      '<groq|gemini|cloudflare|huggingface|local>'
    );
    process.exit(2);
  }

  if (
    process.env.CIWU_PROVIDER_CERTIFICATION !==
    'EXPLICITLY_AUTHORIZED'
  ) {
    console.error(
      'CERTIFICATION_BLOCKED=' +
      'EXPLICIT_AUTHORIZATION_REQUIRED'
    );
    process.exit(3);
  }

  const adapter =
    adapters[provider];

  if (!adapter.configured()) {
    console.log(
      `PROVIDER=${provider}`
    );
    console.log(
      'REAL_INFERENCE=BLOCKED_UNCONFIGURED'
    );
    process.exit(4);
  }

  try {
    const result =
      await adapter.chat({
        messages: [
          {
            role: 'user',
            content:
              'Reply with exactly CIWU-SOVEREIGN-PROVIDER-PASS'
          }
        ]
      });

    if (
      !String(result.text)
        .includes(
          'CIWU-SOVEREIGN-PROVIDER-PASS'
        )
    ) {
      throw new Error(
        'CERTIFICATION_RESPONSE_MISMATCH'
      );
    }

    console.log(
      `PROVIDER=${provider}`
    );
    console.log(
      `MODEL=${result.model}`
    );
    console.log(
      'REAL_INFERENCE=PASS'
    );
  } catch (error) {
    const state =
      health.classify(error);

    console.log(
      `PROVIDER=${provider}`
    );

    console.log(
      `STATE=${state.state}`
    );

    console.log(
      `FALLBACK_ELIGIBLE=${state.fallbackEligible}`
    );

    process.exit(5);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(10);
});
