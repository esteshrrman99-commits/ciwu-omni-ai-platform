'use strict';

const crypto = require('crypto');

const {
  ProviderCertifiedRoutingService
} = require(
  './provider-certified-routing-service-v1'
);

const VERSION =
  'CIWU_PROVIDER_ROUTING_PROVENANCE_V1';

const ZERO_AUTHORITY =
  Object.freeze({
    operational_authority:false,
    tool_authority:false,
    write_runtime_authority:false,
    execute_runtime_authority:false,
    commit_authority:false,
    push_authority:false,
    deploy_authority:false
  });

function authority() {
  return {...ZERO_AUTHORITY};
}

function canonicalize(value) {
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (value[key] === undefined) continue;
      out[key] = canonicalize(value[key]);
    }
    return out;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('NONFINITE_VALUE_FORBIDDEN');
  }

  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  ) {
    throw new Error('NONCANONICAL_VALUE_FORBIDDEN');
  }

  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value === 'string'
        ? value
        : canonicalJson(value)
    )
    .digest('hex');
}

function sanitizeRequest(request = {}) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new Error('ROUTING_REQUEST_INVALID');
  }

  const required =
    Array.isArray(request.required_capabilities)
      ? [...request.required_capabilities]
      : (
          typeof request.required_capability === 'string'
            ? [request.required_capability]
            : []
        );

  const preferred =
    Array.isArray(request.preferred_capabilities)
      ? [...request.preferred_capabilities]
      : [];

  return canonicalize({
    provider:
      typeof request.provider === 'string'
        ? request.provider
        : null,

    model:
      typeof request.model === 'string'
        ? request.model
        : null,

    required_capabilities:
      required,

    preferred_capabilities:
      preferred,

    network_required:false
  });
}

function sanitizeInventory(inventory) {
  if (!inventory || typeof inventory !== 'object') {
    throw new Error('ROUTING_INVENTORY_INVALID');
  }

  return canonicalize({
    ok:
      inventory.ok === true,

    version:
      inventory.version || null,

    providers:
      Array.isArray(inventory.providers)
        ? inventory.providers
        : [],

    model_network_call:false,
    real_provider_credential_used:false,
    authority:authority()
  });
}

function sanitizeDecision(result) {
  if (!result || typeof result !== 'object') {
    throw new Error('ROUTING_RESULT_INVALID');
  }

  return canonicalize({
    ok:
      result.ok === true,

    reason:
      typeof result.reason === 'string'
        ? result.reason
        : null,

    selected:
      result.selected || null,

    eligible:
      Array.isArray(result.eligible)
        ? result.eligible
        : [],

    rejected:
      Array.isArray(result.rejected)
        ? result.rejected
        : [],

    model_network_call:false,
    real_provider_credential_used:false,
    authority:authority()
  });
}

function makeProvenance({
  request,
  inventory,
  result
}) {
  const cleanRequest =
    sanitizeRequest(request);

  const cleanInventory =
    sanitizeInventory(inventory);

  const cleanDecision =
    sanitizeDecision(result);

  const hashes = {
    request_sha256:
      sha256(cleanRequest),

    inventory_sha256:
      sha256(cleanInventory),

    decision_sha256:
      sha256(cleanDecision)
  };

  const envelopeBase = {
    version:VERSION,
    request:cleanRequest,
    inventory:cleanInventory,
    decision:cleanDecision,
    hashes,
    model_network_call:false,
    real_provider_credential_used:false,
    authority:authority()
  };

  return {
    ...envelopeBase,

    hashes:{
      ...hashes,
      envelope_sha256:
        sha256(envelopeBase)
    }
  };
}

function verifyProvenance(provenance) {
  if (!provenance || typeof provenance !== 'object') {
    return {
      ok:false,
      reason:'PROVENANCE_INVALID',
      authority:authority()
    };
  }

  const hashes =
    provenance.hashes || {};

  const expectedRequest =
    sha256(provenance.request);

  const expectedInventory =
    sha256(provenance.inventory);

  const expectedDecision =
    sha256(provenance.decision);

  const base = {
    version:provenance.version,
    request:provenance.request,
    inventory:provenance.inventory,
    decision:provenance.decision,
    hashes:{
      request_sha256:hashes.request_sha256,
      inventory_sha256:hashes.inventory_sha256,
      decision_sha256:hashes.decision_sha256
    },
    model_network_call:false,
    real_provider_credential_used:false,
    authority:authority()
  };

  const expectedEnvelope =
    sha256(base);

  const ok =
    expectedRequest === hashes.request_sha256 &&
    expectedInventory === hashes.inventory_sha256 &&
    expectedDecision === hashes.decision_sha256 &&
    expectedEnvelope === hashes.envelope_sha256;

  return {
    ok,
    reason:
      ok
        ? null
        : 'PROVENANCE_HASH_MISMATCH',
    authority:authority()
  };
}

class ProviderRoutingProvenanceService {

  constructor({
    routingService = null,
    env = Object.freeze({})
  } = {}) {
    this.routingService =
      routingService ||
      new ProviderCertifiedRoutingService({
        env,
        globalNetworkEnabled:false,
        providerAllowlist:[]
      });

    this.version = VERSION;
  }

  decide(request = {}) {
    const inventory =
      this.routingService.inventory();

    const result =
      this.routingService.route(request);

    return {
      ok:true,
      version:this.version,
      result:sanitizeDecision(result),

      provenance:
        makeProvenance({
          request,
          inventory,
          result
        }),

      model_network_call:false,
      real_provider_credential_used:false,
      authority:authority()
    };
  }

  verify(provenance) {
    return verifyProvenance(provenance);
  }

  replay(provenance) {
    const verified =
      verifyProvenance(provenance);

    if (!verified.ok) {
      return {
        ok:false,
        reason:verified.reason,
        replay_match:false,
        model_network_call:false,
        real_provider_credential_used:false,
        authority:authority()
      };
    }

    const currentInventory =
      sanitizeInventory(
        this.routingService.inventory()
      );

    if (
      sha256(currentInventory) !==
      provenance.hashes.inventory_sha256
    ) {
      return {
        ok:false,
        reason:'CURRENT_INVENTORY_DIFFERS',
        replay_match:false,
        model_network_call:false,
        real_provider_credential_used:false,
        authority:authority()
      };
    }

    const rerun =
      sanitizeDecision(
        this.routingService.route(
          provenance.request
        )
      );

    const rerunHash =
      sha256(rerun);

    const match =
      rerunHash ===
      provenance.hashes.decision_sha256;

    return {
      ok:match,
      reason:
        match
          ? null
          : 'ROUTING_REPLAY_MISMATCH',
      replay_match:match,
      decision_sha256:rerunHash,
      model_network_call:false,
      real_provider_credential_used:false,
      authority:authority()
    };
  }
}

module.exports = {
  VERSION,
  canonicalize,
  canonicalJson,
  sha256,
  sanitizeRequest,
  sanitizeInventory,
  sanitizeDecision,
  makeProvenance,
  verifyProvenance,
  ProviderRoutingProvenanceService
};
