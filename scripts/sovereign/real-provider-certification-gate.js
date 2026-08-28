'use strict';

const {
  authorize
} = require(
  '../../src/sovereign/provider-runtime/zero-cost-probe'
);

const result =
  authorize({
    explicitAuthorization:
      process.env
        .CIWU_REAL_INFERENCE_AUTHORIZED ===
      'TRUE',

    providerConfigured:
      process.env
        .CIWU_PROVIDER_CONFIGURED ===
      'TRUE',

    costClass:
      process.env
        .CIWU_PROVIDER_COST_CLASS ||
      'UNKNOWN',

    priceEvidenceFresh:
      process.env
        .CIWU_PRICE_EVIDENCE_FRESH ===
      'TRUE',

    requestedMaximumCostUsd:
      Number(
        process.env
          .CIWU_MAX_PROBE_COST_USD ??
        0
      )
  });

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

process.exit(
  result.allowed
    ? 0
    : 3
);
