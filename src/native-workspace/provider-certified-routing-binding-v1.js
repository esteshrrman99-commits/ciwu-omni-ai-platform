'use strict';

/*
 * CIWU Ω∞ — Certified Provider Routing Binding v1
 *
 * Purpose:
 * Convert evidence emitted by already-existing CIWU provider
 * policy/capability layers into the candidate schema accepted by
 * provider-capability-router-v1.
 *
 * Critical law:
 * CALLER CLAIM != VERIFIED EVIDENCE
 *
 * Callers may request:
 *   provider
 *   model
 *   required/preferred capabilities
 *   network requirement
 *
 * Callers may NOT self-certify:
 *   enabled
 *   healthy
 *   credential_present
 *   network_allowed
 *   policy_eligible
 *   operational/tool/write/execute/etc authority
 *
 * Unknown/missing evidence fails closed.
 */

const {
  routeProvider
} = require(
  './provider-capability-router-v1'
);

const VERSION = 1;

function text(value) {
  return (
    typeof value === 'string'
      ? value.trim()
      : ''
  );
}

function boolPass(value) {
  return value === true;
}

function arrayOfStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(v =>
          typeof v === 'string'
        )
        .map(v => v.trim())
        .filter(Boolean)
    )
  ).sort();
}

function zeroAuthorityCandidate() {
  return {
    operational_authority: false,
    tool_authority: false,
    mutation_authority: false,
    write_authority: false,
    execute_authority: false,
    commit_authority: false,
    push_authority: false,
    deploy_authority: false
  };
}

function zeroAuthorityResult() {
  return {
    operational: false,
    tool: false,
    mutation: false,
    write: false,
    execute: false,
    commit: false,
    push: false,
    deploy: false
  };
}

/*
 * Recognize capability-service evidence conservatively.
 * Multiple shapes are accepted only where the value has an
 * explicit, unambiguous meaning.
 */
function normalizeCapabilityEvidence(
  evidence
) {
  if (
    !evidence ||
    typeof evidence !== 'object'
  ) {
    return {
      verified: false,
      provider: '',
      model: '',
      enabled: false,
      healthy: false,
      capabilities: [],
      priority: 0,
      weight: 0
    };
  }

  const row =
    (
      evidence.capability &&
      typeof evidence.capability === 'object'
    )
      ? evidence.capability
      : evidence;

  const capabilities =
    arrayOfStrings(
      row.capabilities ||
      row.supported_capabilities
    );

  return {
    verified:
      (
        evidence.ok === true ||
        evidence.verified === true ||
        evidence.state ===
          'CAPABILITY_VERIFIED' ||
        row.verified === true
      ),

    provider:
      text(
        row.provider ||
        evidence.provider
      ),

    model:
      text(
        row.model ||
        evidence.model
      ),

    enabled:
      (
        row.enabled === true ||
        evidence.enabled === true
      ),

    healthy:
      (
        row.healthy === true ||
        evidence.healthy === true
      ),

    capabilities,

    priority:
      (
        typeof row.priority === 'number' &&
        Number.isFinite(row.priority)
      )
        ? row.priority
        : 0,

    weight:
      (
        typeof row.weight === 'number' &&
        Number.isFinite(row.weight)
      )
        ? row.weight
        : 0
  };
}

/*
 * Normalize only explicit policy-router evidence.
 *
 * Important:
 * network_call_authorized is transport permission.
 * operational_authority must remain false.
 */
function normalizePolicyEvidence(
  result
) {
  const route =
    (
      result &&
      result.route &&
      typeof result.route === 'object'
    )
      ? result.route
      : {};

  const policy =
    (
      route.policy &&
      typeof route.policy === 'object'
    )
      ? route.policy
      : {};

  const credential =
    (
      route.credential &&
      typeof route.credential === 'object'
    )
      ? route.credential
      : {};

  /*
   * We do not inspect credential values.
   * We only consume boolean metadata emitted by the boundary.
   */
  const credentialPresent =
    (
      credential.all_present === true ||
      credential.credential_present === true ||
      credential.present === true
    );

  const credentialValuesExposed =
    credential.credential_values_exposed;

  const policyEligible =
    (
      result &&
      result.ok === true &&
      policy.operational_authority === false &&
      credentialValuesExposed === false
    );

  return {
    verified:
      Boolean(
        result &&
        typeof result === 'object' &&
        result.route &&
        typeof result.route === 'object'
      ),

    provider:
      text(
        route.provider ||
        result.provider
      ),

    model:
      text(
        route.model ||
        result.model
      ),

    credential_present:
      credentialPresent,

    credential_values_exposed:
      credentialValuesExposed === false,

    network_allowed:
      policy.network_call_authorized === true,

    policy_eligible:
      policyEligible,

    operational_authority:
      policy.operational_authority
  };
}

async function invokeMaybeAsync(
  object,
  method,
  argument
) {
  if (
    !object ||
    typeof object[method] !== 'function'
  ) {
    throw new Error(
      'CERTIFIED_EVIDENCE_SERVICE_MISSING_' +
      method.toUpperCase()
    );
  }

  return await object[method](argument);
}

async function buildCertifiedCandidate({
  policyRouter,
  capabilityService,
  provider,
  model,
  requiredCapability = null,
  networkRequested = true
} = {}) {
  provider = text(provider);
  model = text(model);

  if (!provider || !model) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'PROVIDER_OR_MODEL_MISSING',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  /*
   * The request contains identity and requested properties only.
   * No caller-supplied eligibility booleans are forwarded.
   */
  const policyInput = {
    provider,
    model,
    required_capability:
      requiredCapability || null,
    network_requested:
      networkRequested === true
  };

  const capabilityInput = {
    provider,
    model,
    required_capability:
      requiredCapability || null
  };

  let policyRaw;
  let capabilityRaw;

  try {
    policyRaw =
      await invokeMaybeAsync(
        policyRouter,
        'route',
        policyInput
      );

    capabilityRaw =
      await invokeMaybeAsync(
        capabilityService,
        'evaluate',
        capabilityInput
      );
  } catch (error) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        (
          error &&
          error.message
        )
          ? error.message
          : 'CERTIFIED_EVIDENCE_LOOKUP_FAILED',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  const policy =
    normalizePolicyEvidence(
      policyRaw
    );

  const capability =
    normalizeCapabilityEvidence(
      capabilityRaw
    );

  /*
   * Identity disagreement is not reconciled optimistically.
   */
  if (
    policy.provider &&
    policy.provider !== provider
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'POLICY_PROVIDER_IDENTITY_MISMATCH',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  if (
    policy.model &&
    policy.model !== model
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'POLICY_MODEL_IDENTITY_MISMATCH',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  if (
    capability.provider &&
    capability.provider !== provider
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'CAPABILITY_PROVIDER_IDENTITY_MISMATCH',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  if (
    capability.model &&
    capability.model !== model
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'CAPABILITY_MODEL_IDENTITY_MISMATCH',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  if (
    !policy.verified ||
    !capability.verified
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'CERTIFIED_EVIDENCE_UNVERIFIED',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  if (
    policy.credential_values_exposed !== true
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'CREDENTIAL_BOUNDARY_UNSAFE',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  /*
   * Provider policy can never grant operational authority.
   */
  if (
    policy.operational_authority !== false
  ) {
    return {
      ok: false,
      state:
        'CERTIFIED_CANDIDATE_DENIED',
      reason:
        'POLICY_AUTHORITY_ESCALATION',
      candidate: null,
      authority:
        zeroAuthorityResult()
    };
  }

  const candidate = {
    provider,
    model,

    /*
     * Derived ONLY from evidence.
     */
    enabled:
      boolPass(
        capability.enabled
      ),

    healthy:
      boolPass(
        capability.healthy
      ),

    credential_required: true,

    credential_present:
      boolPass(
        policy.credential_present
      ),

    network_allowed:
      networkRequested === true
        ? boolPass(
            policy.network_allowed
          )
        : true,

    policy_eligible:
      boolPass(
        policy.policy_eligible
      ),

    capabilities:
      [...capability.capabilities],

    priority:
      capability.priority,

    weight:
      capability.weight,

    ...zeroAuthorityCandidate()
  };

  return {
    ok: true,
    state:
      'CERTIFIED_CANDIDATE_BUILT',
    candidate,

    evidence: {
      policy_verified: true,
      capability_verified: true,
      credential_values_exposed: false,
      caller_eligibility_assertions_used: false
    },

    authority:
      zeroAuthorityResult()
  };
}

async function routeCertifiedProviders({
  policyRouter,
  capabilityService,
  providers,
  request = {}
} = {}) {
  if (!Array.isArray(providers)) {
    return {
      version: VERSION,
      ok: false,
      state:
        'CERTIFIED_ROUTING_DENIED',
      reason:
        'PROVIDERS_MUST_BE_ARRAY',
      selected: null,
      authority:
        zeroAuthorityResult()
    };
  }

  const candidates = [];
  const evidenceRejected = [];

  for (const row of providers) {
    const provider =
      text(
        row && row.provider
      );

    const model =
      text(
        row && row.model
      );

    const built =
      await buildCertifiedCandidate({
        policyRouter,
        capabilityService,
        provider,
        model,

        requiredCapability:
          (
            Array.isArray(
              request.required_capabilities
            ) &&
            request.required_capabilities.length
          )
            ? request.required_capabilities[0]
            : null,

        networkRequested:
          request.network_required !== false
      });

    if (!built.ok) {
      evidenceRejected.push({
        provider,
        model,
        reason:
          built.reason
      });

      continue;
    }

    candidates.push(
      built.candidate
    );
  }

  const routed =
    routeProvider({
      candidates,
      request
    });

  return {
    version: VERSION,
    ok: routed.ok,
    state:
      routed.ok
        ? 'CERTIFIED_PROVIDER_SELECTED'
        : 'CERTIFIED_ROUTING_DENIED',

    reason:
      routed.reason,

    selected:
      routed.selected,

    eligible:
      routed.eligible,

    rejected:
      routed.rejected,

    evidence_rejected:
      evidenceRejected,

    caller_eligibility_assertions_used:
      false,

    authority:
      zeroAuthorityResult()
  };
}

module.exports = {
  VERSION,
  normalizePolicyEvidence,
  normalizeCapabilityEvidence,
  buildCertifiedCandidate,
  routeCertifiedProviders
};
