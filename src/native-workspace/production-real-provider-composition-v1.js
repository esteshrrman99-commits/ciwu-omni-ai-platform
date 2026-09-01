'use strict';

/*
 * CIWU Leap025 A2
 *
 * Production real-provider activation policy.
 *
 * IMPORTANT:
 * - This module does not read process.env.
 * - This module does not resolve credentials.
 * - This module does not perform network calls.
 * - This module grants zero operational authority.
 * - External provider activation defaults DENY.
 *
 * Environment parsing belongs to the production composition
 * root so tests can inject sterile configuration.
 */

const PROVIDER_NAME =
  'OPENROUTER';

const DEFAULT_MODEL =
  'openrouter/free';

function authorityZero() {
  return Object.freeze({
    operational:false,
    tool:false,
    mutation:false,
    write:false,
    execute:false,
    commit:false,
    push:false,
    deploy:false
  });
}

function enabled(value) {
  return value === true ||
    value === '1' ||
    value === 'true';
}

function nonEmpty(value) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

function buildProductionRealProviderPolicy({
  externalProvidersEnabled = false,
  openRouterEnabled = false,
  openRouterCredentialPresent = false,
  networkEnabled = false,
  providerAllowlist = [],
  model = DEFAULT_MODEL
} = {}) {
  const externalEnabled =
    enabled(externalProvidersEnabled);

  const providerEnabled =
    enabled(openRouterEnabled);

  const credentialPresent =
    enabled(openRouterCredentialPresent);

  const globalNetworkEnabled =
    enabled(networkEnabled);

  const allowlist =
    Array.isArray(providerAllowlist)
      ? providerAllowlist
          .filter(nonEmpty)
          .map(value => value.trim())
      : [];

  const providerAllowlisted =
    allowlist.includes(
      PROVIDER_NAME
    );

  const normalizedModel =
    nonEmpty(model)
      ? model.trim()
      : DEFAULT_MODEL;

  const networkCallAuthorized =
    externalEnabled &&
    providerEnabled &&
    credentialPresent &&
    globalNetworkEnabled &&
    providerAllowlisted;

  return Object.freeze({
    provider:PROVIDER_NAME,
    model:normalizedModel,

    external_providers_enabled:
      externalEnabled,

    provider_enabled:
      providerEnabled,

    credential_present:
      credentialPresent,

    global_network_enabled:
      globalNetworkEnabled,

    provider_configured:
      providerEnabled,

    provider_supports_network:
      true,

    provider_allowlisted:
      providerAllowlisted,

    network_requested:
      true,

    network_call_authorized:
      networkCallAuthorized,

    local_fallback:
      'CIWU_DRY_RUN',

    authority:
      authorityZero()
  });
}

function describeProductionRealProvider({
  policy
} = {}) {
  if (
    !policy ||
    typeof policy !== 'object'
  ) {
    return Object.freeze({
      ok:false,
      reason:
        'PRODUCTION_PROVIDER_POLICY_REQUIRED',

      provider:PROVIDER_NAME,
      local_fallback:
        'CIWU_DRY_RUN',

      authority:
        authorityZero()
    });
  }

  if (
    policy.network_call_authorized !==
      true
  ) {
    return Object.freeze({
      ok:false,
      reason:
        'REAL_PROVIDER_NOT_AUTHORIZED',

      provider:PROVIDER_NAME,
      model:
        policy.model ||
        DEFAULT_MODEL,

      local_fallback:
        'CIWU_DRY_RUN',

      external_provider_called:false,
      model_network_call:false,
      real_provider_credential_used:false,

      authority:
        authorityZero()
    });
  }

  /*
   * Eligibility is not execution.
   *
   * Even when every independent gate is true this module
   * only describes that the provider is eligible for the
   * separately certified authorized transport.
   */
  return Object.freeze({
    ok:true,
    state:
      'REAL_PROVIDER_ELIGIBLE_NOT_EXECUTED',

    provider:PROVIDER_NAME,
    model:
      policy.model ||
      DEFAULT_MODEL,

    local_fallback:
      'CIWU_DRY_RUN',

    external_provider_called:false,
    model_network_call:false,
    real_provider_credential_used:false,

    authority:
      authorityZero()
  });
}


function parseProviderAllowlist(value) {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function buildProductionRealProviderPolicyFromEnv(
  env = {}
) {
  /*
   * Presence only.
   *
   * Credential contents are never copied into policy,
   * logged, returned or otherwise exposed.
   */
  const credentialPresent =
    typeof env.OPENROUTER_API_KEY === 'string' &&
    env.OPENROUTER_API_KEY.trim().length > 0;

  return buildProductionRealProviderPolicy({
    externalProvidersEnabled:
      env.CIWU_EXTERNAL_PROVIDERS,

    openRouterEnabled:
      env.CIWU_OPENROUTER_ENABLED,

    openRouterCredentialPresent:
      credentialPresent,

    networkEnabled:
      env.CIWU_PROVIDER_NETWORK_ENABLED,

    providerAllowlist:
      parseProviderAllowlist(
        env.CIWU_PROVIDER_ALLOWLIST
      ),

    model:
      env.CIWU_OPENROUTER_MODEL ||
      DEFAULT_MODEL
  });
}


module.exports = {
  PROVIDER_NAME,
  DEFAULT_MODEL,
  buildProductionRealProviderPolicy,
  buildProductionRealProviderPolicyFromEnv,
  describeProductionRealProvider
};
