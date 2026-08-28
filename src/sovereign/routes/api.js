'use strict';

const express =
  require('express');

const router =
  express.Router();

router.use(
  express.json({
    limit: '512kb'
  })
);

const {
  derive
} = require(
  '../provider-runtime/truth-state'
);

const {
  select
} = require(
  '../provider-runtime/routing-policy'
);

const {
  POLICY:
    GITHUB_POLICY
} = require(
  '../github/execution-policy'
);

const {
  capability
} = require(
  '../local-model/manifest'
);

const marker =
  process.env
    .CIWU_SOVEREIGN_BUILD_MARKER ||
  'CIWU_OMEGA120_M1225_M1344';

router.get(
  '/health',
  (req,res) => {
    res.json({
      ok: true,

      fabric:
        'CIWU_SOVEREIGN_INTELLIGENCE_FABRIC',

      generation:
        'OMEGA120_M1225_M1344',

      marker,

      renderGitCommit:
        process.env.RENDER_GIT_COMMIT ||
        null,

      renderGitBranch:
        process.env.RENDER_GIT_BRANCH ||
        null,

      capabilities: {
        providerTruthV2:
          true,

        priceRegistry:
          true,

        budgetLedgerV2:
          true,

        valueRouting:
          true,

        benchmarkTournamentV2:
          true,

        codexModelXeonPipeline:
          true,

        neurotexCertifiedLearning:
          true,

        dependencyGraphV2:
          true,

        githubApprovalGate:
          true,

        localModelSubstrate:
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
          false,

        forcePush:
          false
      }
    });
  }
);

router.get(
  '/capabilities',
  (req,res) => {
    res.json({
      ok: true,

      generation:
        'OMEGA120_M1225_M1344',

      providerTruth:
        'V2',

      providerRouting:
        'VALUE_AND_BUDGET_GATED',

      realInference:
        process.env
          .CIWU_REAL_INFERENCE_AUTHORIZED ===
        'TRUE'
          ? 'EXPLICITLY_AUTHORIZED'
          : 'BLOCKED_BY_DEFAULT',

      paidInference:
        process.env
          .CIWU_PAID_PROVIDER_AUTHORIZED ===
        'TRUE'
          ? 'EXPLICITLY_AUTHORIZED'
          : 'BLOCKED_BY_DEFAULT',

      github:
        GITHUB_POLICY,

      nativeFoundationModel:
        false
    });
  }
);

router.post(
  '/provider/truth',
  (req,res) => {
    res.json({
      ok: true,

      state:
        derive(
          req.body || {}
        )
    });
  }
);

router.post(
  '/route/value',
  (req,res) => {
    const body =
      req.body || {};

    const chosen =
      select(
        Array.isArray(
          body.candidates
        )
          ? body.candidates
          : [],
        {
          remainingBudgetUsd:
            Math.min(
              100,
              Number(
                body
                  .remainingBudgetUsd ??
                100
              )
            ),

          paidAuthorized:
            false
        }
      );

    res.json({
      ok: true,

      selected:
        chosen
          ? {
              id:
                chosen.id,
              eonsScore:
                chosen.eonsScore,
              costClass:
                chosen.costClass
            }
          : null
    });
  }
);

router.post(
  '/local-model/capability',
  (req,res) => {
    try {
      res.json({
        ok: true,
        capability:
          capability(
            req.body
          )
      });
    } catch (error) {
      res
        .status(400)
        .json({
          ok: false,
          error:
            error.message
        });
    }
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
          'EXPLICIT_PROVIDER_BINDING_REQUIRED'
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
