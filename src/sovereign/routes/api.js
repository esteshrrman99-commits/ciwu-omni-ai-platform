'use strict';

const express =
  require('express');

const path =
  require('node:path');

const router =
  express.Router();

router.use(
  express.json({
    limit: '512kb'
  })
);

const {
  allStates,
  sanitizeState
} = require(
  '../provider-control/catalog'
);

const {
  POLICY
} = require(
  '../xeon/policy'
);

const {
  SUITE
} = require(
  '../evaluation/task-suite'
);

const {
  build
} = require(
  '../codex/grounded-context'
);

const {
  select
} = require(
  '../eons/value-router'
);

const marker =
  process.env.CIWU_SOVEREIGN_BUILD_MARKER ||
  'CIWU_OMEGA120_M145_M264';

router.get(
  '/health',
  (req,res) => {
    res.json({
      ok: true,

      fabric:
        'CIWU_SOVEREIGN_INTELLIGENCE_FABRIC',

      generation:
        'OMEGA120_M145_M264',

      marker,

      capabilities: {
        providerVault:
          true,

        providerCertification:
          true,

        runtimeFallback:
          true,

        benchmarking:
          true,

        groundedCodex:
          true,

        modelRepairSandbox:
          true,

        neurotexProjectBrain:
          true,

        githubProposalPlane:
          true
      },

      boundaries: {
        realInferenceDefault:
          false,

        paidInferenceDefault:
          false,

        productionShell:
          false,

        productionAiFilesystemMutation:
          false,

        autonomousGitPush:
          false,

        autonomousPurchase:
          false
      }
    });
  }
);

router.get(
  '/providers',
  (req,res) => {
    res.json({
      ok: true,

      providers:
        allStates()
          .map(
            sanitizeState
          )
    });
  }
);

router.get(
  '/capabilities',
  (req,res) => {
    res.json({
      ok: true,

      generation:
        'OMEGA120_M145_M264',

      providerFederation:
        'READY',

      externalInference:
        process.env
          .CIWU_REAL_INFERENCE_AUTHORIZED ===
        'TRUE'
          ? 'EXPLICITLY_ENABLED'
          : 'BLOCKED_BY_DEFAULT',

      paidInference:
        process.env
          .CIWU_PAID_PROVIDER_AUTHORIZED ===
        'TRUE'
          ? 'EXPLICITLY_ENABLED'
          : 'BLOCKED_BY_DEFAULT',

      codexGrounding:
        'READY',

      xeonRepair:
        'SANDBOX_ONLY',

      neurotex:
        'READY',

      githubMutation:
        'DISABLED'
    });
  }
);

router.post(
  '/route/plan',
  (req,res) => {
    const candidate =
      select(
        Array.isArray(
          req.body?.providers
        )
          ? req.body.providers
          : [],
        {
          paidAuthorized:
            false,

          remainingUsd:
            100
        }
      );

    res.json({
      ok: true,

      selected:
        candidate
          ? {
              id:
                candidate.id,

              projectedCostUsd:
                candidate
                  .projectedCostUsd,

              quality:
                candidate.quality
            }
          : null
    });
  }
);

router.post(
  '/codex/context',
  (req,res) => {
    const query =
      String(
        req.body?.query || ''
      );

    const task =
      String(
        req.body?.task || ''
      );

    if (!query || !task) {
      return res
        .status(400)
        .json({
          ok: false,
          error:
            'QUERY_AND_TASK_REQUIRED'
        });
    }

    const result =
      build({
        projectRoot:
          path.resolve(
            __dirname,
            '../../..'
          ),

        query,
        task,
        topK: 6,
        maxChars: 30000
      });

    res.json({
      ok: true,
      sources:
        result.sources,
      chars:
        result.chars
    });
  }
);

router.get(
  '/xeon-policy',
  (req,res) => {
    res.json({
      ok: true,
      policy: POLICY
    });
  }
);

router.get(
  '/evaluation-suite',
  (req,res) => {
    res.json({
      ok: true,
      suite: SUITE
    });
  }
);

router.post(
  '/infer',
  (req,res) => {
    if (
      process.env
        .CIWU_REAL_INFERENCE_AUTHORIZED !==
      'TRUE'
    ) {
      return res
        .status(403)
        .json({
          ok: false,
          error:
            'REAL_INFERENCE_DISABLED_BY_DEFAULT'
        });
    }

    return res
      .status(501)
      .json({
        ok: false,
        error:
          'LIVE_RUNTIME_INFERENCE_BINDING_NOT_YET_AUTHORIZED'
      });
  }
);

router.post(
  '/execute',
  (req,res) => {
    res.status(403)
      .json({
        ok: false,
        error:
          'PRODUCTION_EXECUTION_DISABLED'
      });
  }
);

router.post(
  '/git/push',
  (req,res) => {
    res.status(403)
      .json({
        ok: false,
        error:
          'AUTONOMOUS_GIT_PUSH_DISABLED'
      });
  }
);

router.post(
  '/purchase',
  (req,res) => {
    res.status(403)
      .json({
        ok: false,
        error:
          'AUTONOMOUS_PURCHASE_DISABLED'
      });
  }
);

module.exports =
  router;
