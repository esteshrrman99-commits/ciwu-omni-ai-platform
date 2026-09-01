'use strict';

/*
 * CIWU Ω∞
 * LEAP023-A4
 *
 * Certified Provider Routing Service
 *
 * Constitutional boundary:
 *
 *   intelligence ≠ operational authority
 *
 * This service performs:
 *
 *   real capability/policy evaluation
 *        ↓
 *   certified-evidence normalization
 *        ↓
 *   A1 deterministic eligibility-first routing
 *
 * It does NOT:
 *   - dispatch a model request
 *   - execute tools
 *   - write workspace files
 *   - execute shell commands
 *   - commit
 *   - push
 *   - deploy
 */

const {
  ProviderCapabilityService
} = require(
  './provider-capability-service-v1'
);

const binding =
  require(
    './provider-certified-routing-binding-v1'
  );

const VERSION =
  'CIWU_PROVIDER_CERTIFIED_ROUTING_SERVICE_V1';

const AUTHORITY = Object.freeze({
  operational_authority:false,
  tool_authority:false,
  write_runtime_authority:false,
  execute_runtime_authority:false,
  commit_authority:false,
  push_authority:false,
  deploy_authority:false
});

function cloneAuthority() {
  return {
    ...AUTHORITY
  };
}

function assertBindingContract() {
  if (
    !binding ||
    typeof binding
      .routeCertifiedProviders !==
      'function'
  ) {
    throw new Error(
      'CERTIFIED_ROUTING_BINDING_REQUIRED'
    );
  }

  if (
    typeof binding
      .normalizePolicyEvidence !==
      'function'
  ) {
    throw new Error(
      'POLICY_NORMALIZER_REQUIRED'
    );
  }

  if (
    typeof binding
      .normalizeCapabilityEvidence !==
      'function'
  ) {
    throw new Error(
      'CAPABILITY_NORMALIZER_REQUIRED'
    );
  }
}

/*
 * A4 intentionally confines compatibility handling to this
 * single integration boundary.
 *
 * A2 remains the authority for certified evidence binding.
 * A1 remains the authority for deterministic selection.
 */
function invokeCertifiedBinding({
  request,
  candidates,
  policyService,
  capabilityService
}) {
  const fn =
    binding.routeCertifiedProviders;

  /*
   * R0 certified the local A2 contract before A4 creation.
   *
   * Prefer the object-envelope form. If this repository's
   * certified A2 uses the request/dependency two-argument
   * form, use that exact alternate shape.
   *
   * A result must be structurally valid; an interface mismatch
   * never becomes eligibility.
   */
  let firstError = null;

  try {
    const result =
      fn({
        request,
        candidates,
        policyService,
        capabilityService
      });

    if (
      result &&
      typeof result === 'object'
    ) {
      return result;
    }
  } catch (error) {
    firstError = error;
  }

  try {
    const result =
      fn(
        {
          ...request,
          candidates
        },
        {
          policyService,
          capabilityService
        }
      );

    if (
      result &&
      typeof result === 'object'
    ) {
      return result;
    }
  } catch (error) {
    if (!firstError) {
      firstError = error;
    }
  }

  const err =
    new Error(
      'CERTIFIED_BINDING_INVOCATION_FAILED'
    );

  if (firstError) {
    err.cause = firstError;
  }

  throw err;
}

class ProviderCertifiedRoutingService {

  constructor({
    env = Object.freeze({}),
    entries,
    configuredProviders = [],
    globalNetworkEnabled = false,
    providerAllowlist = [],
    capabilityService = null,
    policyService = null
  } = {}) {

    assertBindingContract();

    /*
     * Fail closed on caller attempts to silently enable network.
     * A4 is certification/routing only.
     */
    if (globalNetworkEnabled === true) {
      throw new Error(
        'A4_NETWORK_ENABLEMENT_FORBIDDEN'
      );
    }

    if (
      providerAllowlist &&
      !Array.isArray(providerAllowlist)
    ) {
      throw new Error(
        'PROVIDER_ALLOWLIST_INVALID'
      );
    }

    this.env =
      env && typeof env === 'object'
        ? env
        : Object.freeze({});

    this.capabilityService =
      capabilityService ||
      new ProviderCapabilityService({
        env:this.env,
        entries,
        configuredProviders,
        globalNetworkEnabled:false,
        providerAllowlist:
          Array.isArray(providerAllowlist)
            ? providerAllowlist
            : []
      });

    /*
     * The existing ProviderCapabilityService is the real CIWU
     * composition root and contains the certified policy router.
     *
     * A caller may inject a policy-service adapter for testing,
     * but cannot self-certify evidence in request fields.
     */
    this.policyService =
      policyService ||
      this.capabilityService;

    this.version =
      VERSION;
  }

  inventory() {
    const result =
      this.capabilityService.list();

    if (
      !result ||
      result.ok !== true ||
      !Array.isArray(result.registry)
    ) {
      throw new Error(
        'CERTIFIED_PROVIDER_INVENTORY_UNAVAILABLE'
      );
    }

    return {
      ok:true,
      version:this.version,

      providers:
        result.registry.map(row => ({
          provider:
            row.provider,

          models:
            Array.isArray(row.models)
              ? [...row.models]
              : [],

          capabilities:
            Array.isArray(row.capabilities)
              ? [...row.capabilities]
              : [],

          supports_network:
            row.supports_network === true
        })),

      model_network_call:false,
      real_provider_credential_used:false,

      authority:
        cloneAuthority()
    };
  }

  route(request = {}) {

    if (
      !request ||
      typeof request !== 'object' ||
      Array.isArray(request)
    ) {
      throw new Error(
        'ROUTING_REQUEST_INVALID'
      );
    }

    /*
     * Caller-controlled evidence and scoring claims are removed.
     * They must originate from certified CIWU services.
     */
    const sanitizedRequest = {
      provider:
        typeof request.provider === 'string'
          ? request.provider
          : undefined,

      model:
        typeof request.model === 'string'
          ? request.model
          : undefined,

      required_capabilities:
        Array.isArray(
          request.required_capabilities
        )
          ? [...request.required_capabilities]
          : (
              typeof request
                .required_capability ===
                'string'
                ? [
                    request
                      .required_capability
                  ]
                : []
            ),

      preferred_capabilities:
        Array.isArray(
          request.preferred_capabilities
        )
          ? [...request.preferred_capabilities]
          : [],

      /*
       * A4 certification never grants network dispatch.
       */
      network_required:false
    };

    const inventory =
      this.inventory();

    const candidates = [];

    for (
      const providerRow
      of inventory.providers
    ) {
      for (
        const model
        of providerRow.models
      ) {
        candidates.push({
          provider:
            providerRow.provider,

          model,

          capabilities:
            [...providerRow.capabilities]
        });
      }
    }

    if (candidates.length === 0) {
      return {
        ok:false,
        version:this.version,
        reason:
          'NO_CERTIFIED_PROVIDER_CANDIDATES',
        selected:null,
        eligible:[],
        rejected:[],
        model_network_call:false,
        real_provider_credential_used:false,
        authority:
          cloneAuthority()
      };
    }

    const result =
      invokeCertifiedBinding({
        request:sanitizedRequest,
        candidates,
        policyService:
          this.policyService,
        capabilityService:
          this.capabilityService
      });

    if (
      !result ||
      typeof result !== 'object'
    ) {
      throw new Error(
        'CERTIFIED_ROUTING_RESULT_INVALID'
      );
    }

    return {
      ...result,

      version:
        this.version,

      model_network_call:false,
      real_provider_credential_used:false,

      /*
       * A4 can never inherit authority from model/provider
       * intelligence.
       */
      authority:
        cloneAuthority()
    };
  }
}

module.exports = {
  VERSION,
  AUTHORITY,
  ProviderCertifiedRoutingService,
  invokeCertifiedBinding
};
