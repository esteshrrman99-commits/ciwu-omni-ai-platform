'use strict';

const crypto =
  require('node:crypto');

const cortex =
  require('../cortex/router');

const economic =
  require('../eons/economic-router');

const eons =
  require('../eons/gate');

const health =
  require('../federation/health');

function plan({
  task,
  providerCandidates,
  budget
}) {
  const requestId =
    crypto.randomUUID();

  const className =
    cortex.classifyTask(task);

  const provider =
    economic.choose(
      providerCandidates,
      budget
    );

  if (!provider) {
    return {
      requestId,
      className,
      action: 'ABSTAIN',
      reason:
        'NO_QUALIFIED_AUTHORIZED_PROVIDER',
      provider: null
    };
  }

  return {
    requestId,
    className,
    action: 'ROUTE',
    provider
  };
}

function validateOutcome({
  confidence,
  evidenceValid,
  safetyValid,
  dimensionsValid,
  authorization
}) {
  return eons.authorize({
    evidenceValid,
    safetyValid,
    dimensionsValid,
    authorization,
    confidence
  });
}

function status() {
  return {
    fabric:
      'CIWU_SOVEREIGN_INTELLIGENCE_FABRIC',

    generation:
      'OMEGA_INFINITY_LEAP_024',

    state:
      'CORE_FEDERATION_READY',

    providers:
      health.snapshot(),

    boundaries: {
      productionShell:
        false,

      productionAiFilesystemMutation:
        false,

      autonomousGitPush:
        false,

      autonomousPurchase:
        false,

      silentPaidFallback:
        false
    },

    capabilities: {
      providerFederation:
        true,

      economicRouting:
        true,

      codexRepositoryIntelligence:
        true,

      xeonIsolatedWorkspace:
        true,

      realExternalInference:
        'REQUIRES_PROVIDER_CERTIFICATION'
    }
  };
}

module.exports = {
  plan,
  validateOutcome,
  status
};
