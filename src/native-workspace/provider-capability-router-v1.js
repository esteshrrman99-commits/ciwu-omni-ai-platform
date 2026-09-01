'use strict';

/*
 * CIWU Ω∞ — Provider Capability Router v1
 *
 * Constitutional rule:
 *
 *   eligibility(provider) must PASS before optimization(provider)
 *
 * No score, priority, weight, quality estimate or model capability may
 * promote an ineligible provider.
 *
 * This module:
 * - performs zero network activity;
 * - reads zero credentials;
 * - grants zero operational authority;
 * - performs no dispatch;
 * - performs no mutation;
 * - performs deterministic selection only.
 */

const VERSION = 1;

const AUTHORITY_FIELDS = Object.freeze([
  'operational_authority',
  'tool_authority',
  'mutation_authority',
  'write_authority',
  'execute_authority',
  'commit_authority',
  'push_authority',
  'deploy_authority'
]);

const HARD_GATE_ORDER = Object.freeze([
  'SCHEMA',
  'ENABLED',
  'HEALTH',
  'CREDENTIAL',
  'NETWORK',
  'POLICY',
  'AUTHORITY',
  'REQUIRED_CAPABILITIES'
]);

function finiteNumber(value, fallback = 0) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

function canonicalString(value) {
  return (
    typeof value === 'string'
      ? value.trim()
      : ''
  );
}

function normalizeCapabilities(input) {
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .filter(value =>
            typeof value === 'string'
          )
          .map(value =>
            value.trim()
          )
          .filter(Boolean)
      )
    ).sort();
  }

  if (
    input &&
    typeof input === 'object'
  ) {
    return Object.keys(input)
      .filter(key =>
        input[key] === true
      )
      .sort();
  }

  return [];
}

function authorityIsZero(candidate) {
  for (const field of AUTHORITY_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(
        candidate,
        field
      ) &&
      candidate[field] !== false
    ) {
      return false;
    }
  }

  return true;
}

function evaluateEligibility(
  candidate,
  request = {}
) {
  const reasons = [];

  if (
    !candidate ||
    typeof candidate !== 'object' ||
    Array.isArray(candidate)
  ) {
    return {
      eligible: false,
      failed_gate: 'SCHEMA',
      reasons: ['INVALID_PROVIDER_CANDIDATE']
    };
  }

  const provider =
    canonicalString(candidate.provider);

  const model =
    canonicalString(candidate.model);

  if (!provider || !model) {
    reasons.push(
      'PROVIDER_OR_MODEL_MISSING'
    );
  }

  if (reasons.length) {
    return {
      eligible: false,
      failed_gate: 'SCHEMA',
      reasons
    };
  }

  if (candidate.enabled !== true) {
    return {
      eligible: false,
      failed_gate: 'ENABLED',
      reasons: ['PROVIDER_DISABLED']
    };
  }

  if (candidate.healthy !== true) {
    return {
      eligible: false,
      failed_gate: 'HEALTH',
      reasons: ['PROVIDER_UNHEALTHY']
    };
  }

  const credentialRequired =
    candidate.credential_required !== false;

  if (
    credentialRequired &&
    candidate.credential_present !== true
  ) {
    return {
      eligible: false,
      failed_gate: 'CREDENTIAL',
      reasons: ['CREDENTIAL_NOT_VERIFIED_PRESENT']
    };
  }

  const networkRequired =
    request.network_required !== false;

  if (
    networkRequired &&
    candidate.network_allowed !== true
  ) {
    return {
      eligible: false,
      failed_gate: 'NETWORK',
      reasons: ['NETWORK_NOT_ALLOWED']
    };
  }

  /*
   * Policy must have already admitted this candidate.
   * Unknown policy state is not treated as PASS.
   */
  if (candidate.policy_eligible !== true) {
    return {
      eligible: false,
      failed_gate: 'POLICY',
      reasons: ['POLICY_NOT_VERIFIED_ELIGIBLE']
    };
  }

  /*
   * Transport permission is not operational authority.
   * A provider may be permitted to use the model network while
   * remaining unable to grant itself tools/mutation/execution.
   */
  if (!authorityIsZero(candidate)) {
    return {
      eligible: false,
      failed_gate: 'AUTHORITY',
      reasons: ['NONZERO_PROVIDER_AUTHORITY']
    };
  }

  const available =
    normalizeCapabilities(
      candidate.capabilities
    );

  const required =
    normalizeCapabilities(
      request.required_capabilities
    );

  const missing =
    required.filter(
      capability =>
        !available.includes(capability)
    );

  if (missing.length) {
    return {
      eligible: false,
      failed_gate: 'REQUIRED_CAPABILITIES',
      reasons: [
        'REQUIRED_CAPABILITY_MISSING'
      ],
      missing_capabilities: missing
    };
  }

  return {
    eligible: true,
    failed_gate: null,
    reasons: [],
    capabilities: available
  };
}

function scoreEligibleCandidate(
  candidate,
  request = {}
) {
  const capabilities =
    normalizeCapabilities(
      candidate.capabilities
    );

  const preferred =
    normalizeCapabilities(
      request.preferred_capabilities
    );

  const preferredMatches =
    preferred.filter(
      capability =>
        capabilities.includes(capability)
    ).length;

  /*
   * Deterministic integer-oriented score components.
   *
   * Score is irrelevant until every hard gate passes.
   * Priority dominates weight.
   * Optional capability fit refines otherwise eligible choices.
   */
  const priority =
    Math.trunc(
      finiteNumber(
        candidate.priority,
        0
      )
    );

  const weight =
    Math.trunc(
      finiteNumber(
        candidate.weight,
        0
      ) * 1000
    );

  const capabilityFit =
    preferredMatches * 100;

  const score =
    (
      priority * 1000000
    ) +
    (
      weight * 100
    ) +
    capabilityFit;

  return {
    score,
    priority,
    weight,
    preferred_capability_matches:
      preferredMatches
  };
}

function compareEligible(a, b) {
  if (
    a.score.score !==
    b.score.score
  ) {
    return (
      b.score.score -
      a.score.score
    );
  }

  if (
    a.score.priority !==
    b.score.priority
  ) {
    return (
      b.score.priority -
      a.score.priority
    );
  }

  if (
    a.score.weight !==
    b.score.weight
  ) {
    return (
      b.score.weight -
      a.score.weight
    );
  }

  const providerOrder =
    a.provider.localeCompare(
      b.provider,
      'en'
    );

  if (providerOrder !== 0) {
    return providerOrder;
  }

  return a.model.localeCompare(
    b.model,
    'en'
  );
}

function sanitizeCandidate(
  candidate,
  eligibility,
  score = null
) {
  return {
    provider:
      canonicalString(
        candidate.provider
      ),

    model:
      canonicalString(
        candidate.model
      ),

    eligible:
      eligibility.eligible,

    failed_gate:
      eligibility.failed_gate,

    reasons:
      Array.isArray(
        eligibility.reasons
      )
        ? [...eligibility.reasons]
        : [],

    missing_capabilities:
      Array.isArray(
        eligibility.missing_capabilities
      )
        ? [
            ...eligibility
              .missing_capabilities
          ]
        : [],

    score:
      score
        ? score.score
        : null,

    priority:
      score
        ? score.priority
        : null,

    weight:
      score
        ? score.weight
        : null,

    preferred_capability_matches:
      score
        ? score
            .preferred_capability_matches
        : null
  };
}

function routeProvider({
  candidates,
  request = {}
} = {}) {
  if (!Array.isArray(candidates)) {
    return {
      version: VERSION,
      ok: false,
      state:
        'ROUTING_DENIED',
      reason:
        'CANDIDATES_MUST_BE_ARRAY',
      selected: null,
      eligible: [],
      rejected: [],
      authority: zeroAuthority()
    };
  }

  const eligible = [];
  const rejected = [];

  for (const candidate of candidates) {
    const eligibility =
      evaluateEligibility(
        candidate,
        request
      );

    if (!eligibility.eligible) {
      rejected.push(
        sanitizeCandidate(
          candidate || {},
          eligibility
        )
      );

      continue;
    }

    const score =
      scoreEligibleCandidate(
        candidate,
        request
      );

    eligible.push({
      provider:
        canonicalString(
          candidate.provider
        ),

      model:
        canonicalString(
          candidate.model
        ),

      score,

      capabilities:
        normalizeCapabilities(
          candidate.capabilities
        )
    });
  }

  eligible.sort(compareEligible);

  if (eligible.length === 0) {
    return {
      version: VERSION,
      ok: false,
      state:
        'ROUTING_DENIED',
      reason:
        'NO_VERIFIED_ELIGIBLE_PROVIDER',
      selected: null,
      eligible: [],
      rejected,
      authority: zeroAuthority()
    };
  }

  const winner =
    eligible[0];

  return {
    version: VERSION,
    ok: true,
    state:
      'PROVIDER_SELECTED',

    reason:
      'ELIGIBILITY_PASS_THEN_DETERMINISTIC_CAPABILITY_SCORE',

    selected: {
      provider:
        winner.provider,

      model:
        winner.model,

      score:
        winner.score.score,

      priority:
        winner.score.priority,

      weight:
        winner.score.weight,

      preferred_capability_matches:
        winner.score
          .preferred_capability_matches,

      capabilities:
        [...winner.capabilities]
    },

    eligible:
      eligible.map(item => ({
        provider:
          item.provider,

        model:
          item.model,

        eligible: true,

        score:
          item.score.score,

        priority:
          item.score.priority,

        weight:
          item.score.weight,

        preferred_capability_matches:
          item.score
            .preferred_capability_matches
      })),

    rejected,

    authority:
      zeroAuthority()
  };
}

function zeroAuthority() {
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

module.exports = {
  VERSION,
  HARD_GATE_ORDER,
  AUTHORITY_FIELDS,
  normalizeCapabilities,
  authorityIsZero,
  evaluateEligibility,
  scoreEligibleCandidate,
  routeProvider
};
