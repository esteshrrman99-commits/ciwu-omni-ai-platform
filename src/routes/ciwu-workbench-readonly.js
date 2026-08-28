'use strict';

const express=require('express');

const runtime=
  require('../workbench/project-runtime-snapshot-v2');

const repository=
  require('../workbench/repository-inventory-v2');

const symbols=
  require('../workbench/symbol-index-v2');

const providers=
  require('../workbench/provider-runtime-truth-v2');

const neurotex=
  require('../workbench/neurotex-runtime-summary-v2');

const activity=
  require('../workbench/certification-activity-v2');

const router=express.Router();

function noStore(res) {
  res.set(
    'Cache-Control',
    'no-store, max-age=0'
  );
}

router.get('/health',(req,res) => {
  noStore(res);

  res.json({
    ok:true,
    service:'CIWU_WORKBENCH_READONLY_V1',
    mutationAuthority:false,
    gitPushAuthority:false,
    purchaseAuthority:false
  });
});

router.get('/runtime',(req,res) => {
  noStore(res);
  res.json(
    runtime.snapshot(
      process.cwd()
    )
  );
});

router.get('/repository',(req,res) => {
  noStore(res);
  res.json(
    repository.inventory(
      process.cwd()
    )
  );
});

router.get('/symbols',(req,res) => {
  noStore(res);

  const inventory=
    repository.inventory(
      process.cwd()
    );

  res.json(
    symbols.build(
      process.cwd(),
      inventory.entries
    )
  );
});

router.get('/providers',(req,res) => {
  noStore(res);

  res.json(
    providers.truth(
      process.cwd()
    )
  );
});

router.get('/neurotex',(req,res) => {
  noStore(res);

  res.json(
    neurotex.scan(
      process.cwd()
    )
  );
});

router.get('/activity',(req,res) => {
  noStore(res);

  res.json(
    activity.build(
      process.cwd()
    )
  );
});

for (const blocked of [
  '/execute',
  '/write',
  '/apply',
  '/commit',
  '/push',
  '/purchase'
]) {
  router.all(
    blocked,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'WORKBENCH_READ_ONLY'
      });
    }
  );
}


const safeFileInspector =
  require('../workbench/safe-file-inspector-v1');

const projectSearch =
  require('../workbench/project-search-v1');

const symbolDrilldown =
  require('../workbench/symbol-drilldown-v1');

const dependencyGraph =
  require('../workbench/dependency-graph-v1');

const releaseComparator =
  require('../workbench/release-comparator-v1');

const evidenceDrilldown =
  require('../workbench/evidence-drilldown-v1');

const m3ContextAssembler =
  require('../workbench/m3-context-assembler-v1');

router.get('/file',(req,res) => {
  noStore(res);

  try {
    res.json(
      safeFileInspector.inspect(
        process.cwd(),
        req.query.path
      )
    );
  } catch (error) {
    res.status(400).json({
      ok:false,
      error:error.message
    });
  }
});

router.get('/search',(req,res) => {
  noStore(res);

  try {
    const inventory =
      repository.inventory(
        process.cwd()
      );

    res.json(
      projectSearch.search(
        process.cwd(),
        inventory.entries,
        req.query.q
      )
    );
  } catch (error) {
    res.status(400).json({
      ok:false,
      error:error.message
    });
  }
});

router.get('/symbol',(req,res) => {
  noStore(res);

  try {
    res.json(
      symbolDrilldown.locate(
        process.cwd(),
        {
          name:req.query.name || null,
          kind:req.query.kind || null,
          file:req.query.file,
          line:Number(req.query.line)
        }
      )
    );
  } catch (error) {
    res.status(400).json({
      ok:false,
      error:error.message
    });
  }
});

router.get('/dependencies',(req,res) => {
  noStore(res);

  const inventory =
    repository.inventory(
      process.cwd()
    );

  res.json(
    dependencyGraph.build(
      process.cwd(),
      inventory.entries
    )
  );
});

router.get('/releases',(req,res) => {
  noStore(res);

  const releases =
    releaseComparator
      .loadReleases(
        process.cwd()
      )
      .map(
        releaseComparator.summarize
      );

  res.json({
    ok:true,
    readOnly:true,
    releaseCount:releases.length,
    releases
  });
});

router.get('/release-compare',(req,res) => {
  noStore(res);

  try {
    res.json(
      releaseComparator.compare(
        process.cwd(),
        req.query.from,
        req.query.to
      )
    );
  } catch (error) {
    res.status(400).json({
      ok:false,
      error:error.message
    });
  }
});

router.get('/evidence-record',(req,res) => {
  noStore(res);

  try {
    res.json(
      evidenceDrilldown.read(
        process.cwd(),
        req.query.file
      )
    );
  } catch (error) {
    res.status(400).json({
      ok:false,
      error:error.message
    });
  }
});

router.post(
  '/context-assemble',
  express.json({
    limit:'64kb'
  }),
  (req,res) => {
    noStore(res);

    const body =
      req.body &&
      typeof req.body === 'object'
        ? req.body
        : {};

    res.json(
      m3ContextAssembler.assemble({
        root:process.cwd(),
        files:
          Array.isArray(body.files)
            ? body.files
            : [],
        symbols:
          Array.isArray(body.symbols)
            ? body.symbols
            : []
      })
    );
  }
);


// CIWU_PROJECT_BRAIN_API_V1

const ciwuProjectBrainGraph =
  require('../workbench/project-brain-graph-v1');

const ciwuGroundedContext =
  require('../workbench/grounded-context-selector-v1');

const ciwuCitationEnvelope =
  require('../workbench/source-citation-envelope-v1');

const ciwuRegressionPlan =
  require('../workbench/regression-plan-generator-v1');

const ciwuCandidatePatchPlan =
  require('../workbench/candidate-patch-plan-v1');

router.get(
  '/project-brain',
  (req,res) => {
    noStore(res);

    try {
      res.json(
        ciwuProjectBrainGraph.build(
          process.cwd()
        )
      );
    } catch (error) {
      res.status(400).json({
        ok:false,
        error:error.message
      });
    }
  }
);

router.post(
  '/grounded-context',
  (req,res) => {
    noStore(res);

    const body =
      req.body &&
      typeof req.body === 'object'
        ? req.body
        : {};

    try {
      const grounded =
        ciwuGroundedContext.select({
          root:process.cwd(),
          files:
            Array.isArray(body.files)
              ? body.files
              : [],
          symbols:
            Array.isArray(body.symbols)
              ? body.symbols
              : []
        });

      res.json({
        ...grounded,
        citations:
          ciwuCitationEnvelope.build(
            grounded
          )
      });
    } catch (error) {
      res.status(400).json({
        ok:false,
        error:error.message
      });
    }
  }
);

router.post(
  '/regression-plan',
  (req,res) => {
    noStore(res);

    const body =
      req.body &&
      typeof req.body === 'object'
        ? req.body
        : {};

    try {
      res.json(
        ciwuRegressionPlan.generate({
          root:process.cwd(),
          files:
            Array.isArray(body.files)
              ? body.files
              : []
        })
      );
    } catch (error) {
      res.status(400).json({
        ok:false,
        error:error.message
      });
    }
  }
);

router.post(
  '/candidate-patch-plan',
  (req,res) => {
    noStore(res);

    const body =
      req.body &&
      typeof req.body === 'object'
        ? req.body
        : {};

    try {
      res.json(
        ciwuCandidatePatchPlan.plan({
          root:process.cwd(),
          objective:
            body.objective || '',
          files:
            Array.isArray(body.files)
              ? body.files
              : [],
          symbols:
            Array.isArray(body.symbols)
              ? body.symbols
              : []
        })
      );
    } catch (error) {
      res.status(400).json({
        ok:false,
        error:error.message
      });
    }
  }
);


// CIWU_CODEX_XEON_API_V1
const ciwuXeonPolicy =
  require('../workbench/xeon-sandbox-policy-v1');

router.get(
  '/xeon/status',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_CODEX_XEON_SANDBOX_V1',
      sandboxPatchGeneration:true,
      sandboxPatchApplication:true,
      sandboxValidation:true,
      boundedNodeExecution:true,
      arbitraryShell:false,
      productionMutation:false,
      productionExecution:false,
      gitCommitAuthority:false,
      gitPushAuthority:false,
      deploymentAuthority:false,
      purchaseAuthority:false,
      providerCallsRequired:false,
      maxFiles:
        ciwuXeonPolicy.MAX_FILES,
      maxPatchOperations:
        ciwuXeonPolicy.MAX_PATCH_OPERATIONS
    });
  }
);

for (
  const route of [
    '/xeon/generate',
    '/xeon/apply',
    '/xeon/validate',
    '/xeon/commit',
    '/xeon/push',
    '/xeon/deploy'
  ]
) {
  router.all(
    route,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'PRODUCTION_XEON_MUTATION_DISABLED',
        sandboxCliOnly:true
      });
    }
  );
}


// CIWU_AUTONOMOUS_REPAIR_SEARCH_API_V1
const ciwuRepairSearchPolicy =
  require('../workbench/autonomous-repair-search-policy-v1');

router.get(
  '/xeon/repair-search/status',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_AUTONOMOUS_REPAIR_SEARCH_V1',
      autonomousCandidateSearch:true,
      impactAwareTestSelection:true,
      multiCandidateSandboxValidation:true,
      evidenceWeightedRanking:true,
      failureClassification:true,
      humanReviewHandoff:true,
      maxCandidates:
        ciwuRepairSearchPolicy.MAX_CANDIDATES,
      maxTests:
        ciwuRepairSearchPolicy.MAX_TESTS,
      confidenceIsTruth:false,
      optimizationIsAuthorization:false,
      productionApplyAuthority:false,
      gitCommitAuthority:false,
      gitPushAuthority:false,
      deploymentAuthority:false,
      purchaseAuthority:false
    });
  }
);

router.get(
  '/xeon/human-review-policy',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_HUMAN_REVIEW_POLICY_V1',
      humanReviewRequired:true,
      explicitSeparateAuthorizationRequired:true,
      productionApplyAuthorized:false,
      gitCommitAuthorized:false,
      gitPushAuthorized:false,
      deploymentAuthorized:false,
      purchaseAuthorized:false
    });
  }
);

for (
  const route of [
    '/xeon/repair-search/run',
    '/xeon/repair-search/apply',
    '/xeon/repair-search/commit',
    '/xeon/repair-search/push',
    '/xeon/repair-search/deploy'
  ]
) {
  router.all(
    route,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'SERVER_SIDE_AUTONOMOUS_REPAIR_EXECUTION_DISABLED',
        localSandboxOnly:true,
        humanReviewRequired:true
      });
    }
  );
}


// CIWU_REPAIR_APPROVAL_API_V1
const ciwuApprovalPolicy =
  require('../workbench/approval-policy-v1');

router.get(
  '/xeon/approval/status',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_REPAIR_APPROVAL_CONTROL_PLANE_V1',
      immutableProposal:true,
      deterministicDiffEnvelope:true,
      evidenceBinding:true,
      baseShaBinding:true,
      signedShortLivedTokens:true,
      replayProtection:true,
      tokenExpiry:true,
      reviewWorkspaceApplyGate:true,
      postApplyReverification:true,
      approvalScope:
        ciwuApprovalPolicy.ALLOWED_SCOPE,
      maxTokenTtlSeconds:
        ciwuApprovalPolicy.MAX_TOKEN_TTL_SECONDS,
      liveTokenIssuance:false,
      productionApplyAuthority:false,
      gitCommitAuthority:false,
      gitPushAuthority:false,
      deploymentAuthority:false,
      purchaseAuthority:false
    });
  }
);

router.get(
  '/xeon/approval/policy',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_REPAIR_APPROVAL_POLICY_V1',
      humanApprovalRequired:true,
      exactProposalBinding:true,
      exactEvidenceBinding:true,
      exactBaseShaBinding:true,
      expiryRequired:true,
      replayProtectionRequired:true,
      postApplyReverificationRequired:true,
      productionApplyAuthorized:false,
      gitCommitAuthorized:false,
      gitPushAuthorized:false,
      deploymentAuthorized:false,
      purchaseAuthorized:false
    });
  }
);

for (
  const route of [
    '/xeon/approval/issue',
    '/xeon/approval/apply',
    '/xeon/approval/commit',
    '/xeon/approval/push',
    '/xeon/approval/deploy'
  ]
) {
  router.all(
    route,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'LIVE_APPROVAL_MUTATION_DISABLED',
        humanApprovalRequired:true,
        localReviewWorkspaceOnly:true
      });
    }
  );
}


// CIWU_CORTEX_ENGINEERING_LOOP_API_V1
const ciwuGapRegistry =
  require('../workbench/capability-gap-registry-v1');

const ciwuEngineeringLoop =
  require('../workbench/cortex-autonomous-engineering-loop-v1');

const ciwuEngineeringEvals =
  require('../workbench/cortex-engineering-evals-v1');

router.get(
  '/cortex/intelligence/status',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:
        'CIWU_CORTEX_ENGINEERING_INTELLIGENCE_STATUS_V1',
      capabilityGapRegistry:true,
      taskDecomposition:true,
      hierarchicalContextCompiler:true,
      engineeringPlanSynthesis:true,
      critic:true,
      judge:true,
      boundedAutonomousRepairLoop:true,
      benchmarkHarness:true,
      maximumAutonomousIterations:
        ciwuEngineeringLoop.MAX_ITERATIONS,
      productionMutation:false,
      autonomousGitCommit:false,
      autonomousGitPush:false,
      autonomousDeployment:false,
      purchaseAuthority:false,
      universalSuperiorityClaim:false
    });
  }
);

router.get(
  '/cortex/capability-gaps',
  (req,res) => {
    noStore(res);

    res.json(
      ciwuGapRegistry.snapshot()
    );
  }
);

router.get(
  '/cortex/evals/policy',
  (req,res) => {
    noStore(res);

    res.json({
      ok:true,
      schema:'CIWU_CORTEX_EVAL_POLICY_V1',
      metrics:
        ciwuEngineeringEvals.METRICS,
      benchmarkEvidenceRequired:true,
      universalSuperiorityClaim:false,
      confidenceIsTruth:false,
      optimizationIsAuthorization:false
    });
  }
);

for (
  const route of [
    '/cortex/run',
    '/cortex/apply',
    '/cortex/commit',
    '/cortex/push',
    '/cortex/deploy'
  ]
) {
  router.all(
    route,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'CORTEX_PRODUCTION_MUTATION_DISABLED',
        sandboxOrOfflineEngineOnly:true,
        humanAuthorizationRequired:true
      });
    }
  );
}

module.exports=router;
