'use strict';

const assert = require('node:assert/strict');

const math =
  require('../../src/kernel/cve-qn');

const dims =
  require('../../src/kernel/cve-qn/dimensions');

const gate =
  require('../../src/sovereign/eons/gate');

const budget =
  require('../../src/sovereign/eons/budget');

const cortex =
  require('../../src/sovereign/cortex/router');

const vortex =
  require('../../src/sovereign/vortex/state-machine');

const zortex =
  require('../../src/sovereign/zortex/registry');

const { MemoryStore } =
  require('../../src/sovereign/neurotex/memory');

const federation =
  require('../../src/sovereign/federation/router');

const contract =
  require('../../src/sovereign/federation/contract');

const github =
  require('../../src/sovereign/github/nexus');

const health =
  require('../../src/sovereign/capabilities/health');

assert.equal(math.power(10, 2), 20);
assert.equal(math.energyDiscrete([{power:20,dt:3}]), 60);

assert.ok(
  Math.abs(
    math.entropy([0.5,0.5]) - 1
  ) < 1e-10
);

assert.equal(
  math.informationGain(1,0.4),
  0.6
);

assert.equal(
  math.masterGate({
    score: 99,
    threshold: 75,
    dimensions: true,
    evidence: true,
    safety: true,
    authorization: false
  }).action,
  'ABSTAIN'
);

assert.equal(
  dims.normalizePrefix(5,'k'),
  5000
);

assert.equal(
  dims.equalDimensions(
    dims.multiplyDimensions(
      dims.DIMENSIONS.V,
      dims.DIMENSIONS.A
    ),
    dims.DIMENSIONS.W
  ),
  true
);

assert.equal(
  gate.classifyTruth(undefined),
  'UNKNOWN'
);

assert.equal(
  gate.authorize({
    evidenceValid:true,
    safetyValid:true,
    dimensionsValid:true,
    authorization:false,
    confidence:1
  }).decision,
  'ABSTAIN'
);

assert.equal(
  budget.authorizeSpend({
    monthlySpentUsd:99,
    projectedRequestUsd:2,
    paidProviderAuthorized:true
  }).authorized,
  false
);

assert.equal(
  budget.authorizeSpend({
    monthlySpentUsd:99,
    projectedRequestUsd:0,
    paidProviderAuthorized:false
  }).authorized,
  true
);

assert.equal(
  cortex.classifyTask({
    complexity:1,
    risk:1,
    novelty:1
  }),
  'FRONTIER'
);

assert.throws(
  () => vortex.transition('RECEIVED','COMPLETED'),
  /ILLEGAL_TRANSITION/
);

zortex.register({
  id:'web-search',
  type:'RESEARCH',
  available:true,
  verified:true,
  mutation:false
});

assert.equal(
  zortex.executable('web-search'),
  true
);

const memory = new MemoryStore();

const record = memory.add({
  content:'UNKNOWN is not zero',
  provenance:'CVE-QN',
  confidence:1,
  tags:['invariant']
});

assert.ok(record.id);
assert.equal(
  memory.search('UNKNOWN').length,
  1
);

const selected = federation.route([
  {
    id:'free',
    available:true,
    verified:true,
    estimatedCostUsd:0,
    quality:0.7,
    reliability:0.9,
    coding:0.8
  },
  {
    id:'paid',
    available:true,
    verified:true,
    estimatedCostUsd:0.01,
    quality:1,
    reliability:1,
    coding:1
  }
],{
  allowPaid:true,
  remainingMonthlyBudgetUsd:100
});

assert.equal(selected.id,'free');

assert.equal(
  contract.classifyProviderFailure({
    status:429,
    message:'no credits remaining'
  }).fallbackEligible,
  true
);

const repo = github.inspectRepository();
assert.ok(repo.head);

assert.equal(
  github.mutationPolicy().pushByAI,
  false
);

const h = health.health();

assert.equal(
  h.status,
  'FOUNDATION_READY'
);

assert.equal(
  h.claims.nativeFoundationModel,
  false
);

console.log(
  'CIWU_SOVEREIGN_GENESIS_TESTS_PASS'
);
