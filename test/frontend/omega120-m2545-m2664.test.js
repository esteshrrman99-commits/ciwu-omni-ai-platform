'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const gaps=
  require('../../src/workbench/capability-gap-registry-v1');

const decomposer=
  require('../../src/workbench/cortex-task-decomposer-v1');

const compiler=
  require('../../src/workbench/cortex-context-compiler-v1');

const planner=
  require('../../src/workbench/cortex-plan-synthesizer-v1');

const critic=
  require('../../src/workbench/cortex-critic-v1');

const judge=
  require('../../src/workbench/cortex-judge-v1');

const loop=
  require('../../src/workbench/cortex-autonomous-engineering-loop-v1');

const evals=
  require('../../src/workbench/cortex-engineering-evals-v1');

const envelope=
  require('../../src/workbench/cortex-intelligence-envelope-v1');

(async()=>{
  const registry=gaps.snapshot();

  assert.equal(
    registry.benchmarkEvidenceRequired,
    true
  );

  assert.equal(
    registry.universalSuperiorityClaim,
    false
  );

  const decomposition=
    decomposer.decompose({
      objective:
        'Repair deterministic synthetic project defect.',
      evidenceAvailable:true
    });

  assert.equal(
    decomposition.tasks.length,
    10
  );

  const context=
    compiler.compile({
      objective:decomposition.objective,
      sections:[
        {
          source:'src/a.js',
          content:'module.exports=41;',
          relevance:1
        },
        {
          source:'test/a.test.js',
          content:'expected 42',
          relevance:0.95
        }
      ]
    });

  assert.equal(context.admittedCount,2);

  const plan=
    planner.synthesize({
      decomposition,
      context
    });

  assert.match(
    plan.planHash,
    /^[0-9a-f]{64}$/
  );

  const critique=
    critic.critique({
      candidate:{ok:true},
      validation:{
        ok:true,
        regression:false
      },
      context,
      plan
    });

  assert.equal(
    critique.acceptable,
    true
  );

  const verdict=
    judge.judge({
      critic:critique,
      gates:{
        dimensionsValid:true,
        provenanceValid:true,
        validationPassed:true,
        noCriticalRegression:true,
        authorizationValid:true
      },
      evidenceScore:0.99
    });

  assert.equal(
    verdict.verified,
    true
  );

  let repaired=false;

  const result=await loop.run({
    objective:
      'Repair deterministic synthetic project defect.',
    contextSections:[
      {
        source:'src/a.js',
        content:'module.exports=41;',
        relevance:1
      }
    ],
    evidenceScore:0.99,

    generateCandidate:async()=>({
      value:41
    }),

    validateCandidate:async({candidate})=>({
      ok:candidate.value===42,
      regression:false,
      dimensionsValid:true,
      provenanceValid:true
    }),

    repairCandidate:async()=> {
      repaired=true;
      return {value:42};
    }
  });

  assert.equal(repaired,true);
  assert.equal(result.status,'VERIFIED');
  assert.equal(result.productionMutation,false);

  const benchmark=
    evals.compare({
      baseline:{
        taskSuccess:0.70,
        validationPassRate:0.70,
        regressionAvoidance:0.90,
        evidenceCompleteness:0.70,
        repairEfficiency:0.65,
        contextPrecision:0.75
      },
      candidate:{
        taskSuccess:0.90,
        validationPassRate:0.95,
        regressionAvoidance:0.97,
        evidenceCompleteness:0.95,
        repairEfficiency:0.87,
        contextPrecision:0.92
      }
    });

  assert.equal(
    benchmark.improved,
    true
  );

  const proof=envelope.create({
    gapRegistry:registry,
    loopResult:result,
    evaluation:benchmark
  });

  assert.match(
    proof.evidenceHash,
    /^[0-9a-f]{64}$/
  );

  const release=JSON.parse(
    fs.readFileSync(
      'data/sovereign/omega120-m2545-m2664.json',
      'utf8'
    )
  );

  assert.equal(release.milestoneCount,120);
  assert.equal(release.productionMutation,false);
  assert.equal(release.autonomousGitPush,false);
  assert.equal(release.universalSuperiorityClaim,false);

  console.log(
    'CIWU_OMEGA120_M2545_M2664_TEST_PASS'
  );
})().catch(error=>{
  console.error(error);
  process.exit(1);
});
