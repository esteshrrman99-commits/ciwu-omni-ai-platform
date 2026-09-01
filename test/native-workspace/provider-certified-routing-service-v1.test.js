'use strict';

const assert =
  require('assert/strict');

const {
  VERSION,
  ProviderCertifiedRoutingService
} = require(
  '../../src/native-workspace/provider-certified-routing-service-v1'
);

function authorityZero(value) {
  const a =
    value &&
    value.authority;

  assert.ok(a);

  assert.equal(
    a.operational_authority,
    false
  );

  assert.equal(
    a.tool_authority,
    false
  );

  assert.equal(
    a.write_runtime_authority,
    false
  );

  assert.equal(
    a.execute_runtime_authority,
    false
  );

  assert.equal(
    a.commit_authority,
    false
  );

  assert.equal(
    a.push_authority,
    false
  );

  assert.equal(
    a.deploy_authority,
    false
  );
}

/*
 * 01 — real composition root constructs under sterile env.
 */
{
  const service =
    new ProviderCertifiedRoutingService({
      env:Object.freeze({}),
      globalNetworkEnabled:false,
      providerAllowlist:[]
    });

  assert.equal(
    service.version,
    VERSION
  );

  console.log(
    'T01_REAL_COMPOSITION_ROOT=PASS'
  );
}

/*
 * 02 — A4 refuses caller network enablement.
 */
{
  assert.throws(
    () =>
      new ProviderCertifiedRoutingService({
        globalNetworkEnabled:true
      }),
    /A4_NETWORK_ENABLEMENT_FORBIDDEN/
  );

  console.log(
    'T02_NETWORK_ENABLEMENT_DENIED=PASS'
  );
}

/*
 * 03 — inventory uses real registry.
 */
let service;
let inventory;

{
  service =
    new ProviderCertifiedRoutingService({
      env:Object.freeze({}),
      globalNetworkEnabled:false,
      providerAllowlist:[]
    });

  inventory =
    service.inventory();

  assert.equal(
    inventory.ok,
    true
  );

  assert.ok(
    Array.isArray(
      inventory.providers
    )
  );

  assert.ok(
    inventory.providers.length > 0
  );

  assert.equal(
    inventory.model_network_call,
    false
  );

  assert.equal(
    inventory
      .real_provider_credential_used,
    false
  );

  authorityZero(inventory);

  console.log(
    'T03_REAL_REGISTRY_INVENTORY=PASS'
  );
}

/*
 * 04 — choose a capability from registry, never guessed.
 */
const row =
  inventory.providers[0];

assert.ok(row);
assert.ok(row.provider);
assert.ok(row.models.length > 0);
assert.ok(row.capabilities.length > 0);

const realCapability =
  row.capabilities[0];

/*
 * 05 — route through A4.
 *
 * The route may select or reject depending on certified
 * evidence, but it may not create operational authority.
 */
{
  const result =
    service.route({
      provider:
        row.provider,

      model:
        row.models[0],

      required_capabilities:[
        realCapability
      ]
    });

  assert.ok(result);
  assert.equal(
    typeof result,
    'object'
  );

  assert.equal(
    result.model_network_call,
    false
  );

  assert.equal(
    result
      .real_provider_credential_used,
    false
  );

  authorityZero(result);

  console.log(
    'T04_CERTIFIED_ROUTING_CHAIN=PASS'
  );
}

/*
 * 06 — caller self-asserted health cannot become evidence.
 */
{
  const result =
    service.route({
      provider:
        row.provider,

      model:
        row.models[0],

      required_capabilities:[
        realCapability
      ],

      healthy:true,
      credential_present:true,
      policy_eligible:true,
      network_allowed:true,
      priority:999999,
      weight:999999
    });

  assert.ok(result);

  assert.equal(
    result.model_network_call,
    false
  );

  authorityZero(result);

  console.log(
    'T05_CALLER_EVIDENCE_INJECTION_BLOCKED=PASS'
  );
}

/*
 * 07 — caller authority escalation cannot survive.
 */
{
  const result =
    service.route({
      provider:
        row.provider,

      model:
        row.models[0],

      required_capabilities:[
        realCapability
      ],

      operational_authority:true,
      tool_authority:true,
      write_runtime_authority:true,
      execute_runtime_authority:true,
      commit_authority:true,
      push_authority:true,
      deploy_authority:true
    });

  authorityZero(result);

  console.log(
    'T06_AUTHORITY_ESCALATION_BLOCKED=PASS'
  );
}

/*
 * 08 — no dispatch surface exists.
 */
{
  assert.equal(
    typeof service.dispatch,
    'undefined'
  );

  assert.equal(
    typeof service.execute,
    'undefined'
  );

  assert.equal(
    typeof service.commit,
    'undefined'
  );

  assert.equal(
    typeof service.push,
    'undefined'
  );

  assert.equal(
    typeof service.deploy,
    'undefined'
  );

  console.log(
    'T07_EXECUTION_SURFACES_ABSENT=PASS'
  );
}

console.log(
  'A4_DEDICATED_TEST=PASS'
);
