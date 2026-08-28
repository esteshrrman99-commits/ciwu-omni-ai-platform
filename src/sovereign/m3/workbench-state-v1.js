'use strict';

function build({
  providers = [],
  selected = null,
  trace = null
} = {}) {
  const sanitized =
    providers.map(p => ({
      provider:
        p.provider,

      model:
        p.model,

      configured:
        p.configured === true,

      certified:
        p.certified === true,

      runtimeEligible:
        p.runtimeEligible === true,

      evidenceFresh:
        p.evidenceFresh === true,

      costClass:
        p.costClass || 'UNKNOWN',

      circuitOpen:
        p.circuitOpen === true
    }));

  return {
    schema:
      'CIWU_M3_FEDERATION_WORKBENCH_V1',

    providerCount:
      sanitized.length,

    providers:
      sanitized,

    selected:
      selected
        ? {
            provider:
              selected.provider,

            model:
              selected.model
          }
        : null,

    trace:
      trace || null,

    executionEnabled:
      false,

    productionMutationEnabled:
      false,

    purchaseEnabled:
      false
  };
}

module.exports = {
  build
};
