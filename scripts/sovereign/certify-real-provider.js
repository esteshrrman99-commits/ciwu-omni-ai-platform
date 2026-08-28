'use strict';

const path =
  require('node:path');

const {
  inject
} = require(
  '../../src/sovereign/vault/provider-vault'
);

const {
  certify
} = require(
  '../../src/sovereign/provider-runtime/certifier'
);

async function main() {
  const provider =
    process.argv[2];

  const costClass =
    String(
      process.argv[3] || 'UNKNOWN'
    ).toUpperCase();

  if (!provider)
    throw new Error(
      'PROVIDER_REQUIRED'
    );

  const project =
    path.resolve(
      __dirname,
      '../..'
    );

  const vault =
    path.join(
      project,
      '.ciwu-private',
      'provider-vault.json'
    );

  try {
    inject({
      file: vault,
      provider
    });
  } catch {}

  const result =
    await certify({
      provider,
      costClass,

      realInferenceAuthorized:
        process.env
          .CIWU_REAL_INFERENCE_AUTHORIZED ===
        'TRUE',

      paidProviderAuthorized:
        process.env
          .CIWU_PAID_PROVIDER_AUTHORIZED ===
        'TRUE'
    });

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  if (
    result.certified !== true
  ) {
    process.exitCode = 4;
  }
}

main().catch(error => {
  console.error(
    error.message
  );
  process.exit(10);
});
