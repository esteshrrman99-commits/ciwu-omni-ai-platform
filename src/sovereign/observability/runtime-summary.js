'use strict';

function summarize({
  providers = [],
  budget,
  safety
}) {
  return {
    providerCount:
      providers.length,

    certifiedProviderCount:
      providers.filter(
        x =>
          x.certified ===
          true
      ).length,

    availableProviderCount:
      providers.filter(
        x =>
          x.available ===
          true
      ).length,

    budget: {
      hardCapUsd:
        Number(
          budget?.hardCapUsd ??
          100
        ),

      spentUsd:
        Number(
          budget?.spentUsd ??
          0
        )
    },

    safety: {
      productionMutation:
        safety
          ?.productionMutation ===
        true,

      autonomousPush:
        safety
          ?.autonomousPush ===
        true,

      autonomousPurchase:
        safety
          ?.autonomousPurchase ===
        true
    }
  };
}

module.exports = {
  summarize
};
