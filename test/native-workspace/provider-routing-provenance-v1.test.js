'use strict';

const assert = require('assert/strict');

const {
  canonicalJson,
  sha256,
  ProviderRoutingProvenanceService
} = require(
  '../../src/native-workspace/provider-routing-provenance-v1'
);

function zeroAuthority(v) {
  const a = v && v.authority;
  assert.ok(a);

  for (const key of [
    'operational_authority',
    'tool_authority',
    'write_runtime_authority',
    'execute_runtime_authority',
    'commit_authority',
    'push_authority',
    'deploy_authority'
  ]) {
    assert.equal(a[key], false);
  }
}

{
  const x = {b:2,a:1,z:{y:2,x:1}};
  const y = {z:{x:1,y:2},a:1,b:2};

  assert.equal(canonicalJson(x), canonicalJson(y));
  assert.equal(sha256(x), sha256(y));

  console.log('T01_CANONICALIZATION=PASS');
}

const service =
  new ProviderRoutingProvenanceService({
    env:Object.freeze({})
  });

const inventory =
  service.routingService.inventory();

assert.ok(inventory.providers.length > 0);

const row =
  inventory.providers[0];

assert.ok(row.models.length > 0);
assert.ok(row.capabilities.length > 0);

const decision =
  service.decide({
    provider:row.provider,
    model:row.models[0],
    required_capabilities:[
      row.capabilities[0]
    ],

    healthy:true,
    credential_present:true,
    policy_eligible:true,
    network_allowed:true,
    priority:999999,
    operational_authority:true
  });

assert.equal(decision.ok, true);
assert.equal(decision.model_network_call, false);
assert.equal(decision.real_provider_credential_used, false);
zeroAuthority(decision);

console.log('T02_PROVENANCE_CREATED=PASS');

for (const forbidden of [
  'healthy',
  'credential_present',
  'policy_eligible',
  'network_allowed',
  'priority',
  'operational_authority'
]) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      decision.provenance.request,
      forbidden
    ),
    false
  );
}

console.log('T03_SELF_ASSERTION_EXCLUDED=PASS');

{
  const verify =
    service.verify(
      decision.provenance
    );

  assert.equal(verify.ok, true);
  zeroAuthority(verify);

  console.log('T04_PROVENANCE_VERIFY=PASS');
}

{
  const replay =
    service.replay(
      decision.provenance
    );

  assert.equal(replay.ok, true);
  assert.equal(replay.replay_match, true);
  zeroAuthority(replay);

  console.log('T05_DETERMINISTIC_REPLAY=PASS');
}

{
  const tampered =
    JSON.parse(
      JSON.stringify(
        decision.provenance
      )
    );

  tampered.request.model += '-TAMPER';

  const verify =
    service.verify(tampered);

  assert.equal(verify.ok, false);
  assert.equal(
    verify.reason,
    'PROVENANCE_HASH_MISMATCH'
  );

  console.log('T06_REQUEST_TAMPER=PASS');
}

{
  const tampered =
    JSON.parse(
      JSON.stringify(
        decision.provenance
      )
    );

  tampered.decision.ok =
    !tampered.decision.ok;

  assert.equal(
    service.verify(tampered).ok,
    false
  );

  console.log('T07_DECISION_TAMPER=PASS');
}

assert.equal(typeof service.dispatch, 'undefined');
assert.equal(typeof service.execute, 'undefined');
assert.equal(typeof service.commit, 'undefined');
assert.equal(typeof service.push, 'undefined');
assert.equal(typeof service.deploy, 'undefined');

console.log('T08_EXECUTION_SURFACES_ABSENT=PASS');
console.log('A5_DEDICATED_TEST=PASS');
