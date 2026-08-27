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

const marker =
  process.env.CIWU_SOVEREIGN_BUILD_MARKER ||
  'CIWU_OMEGA120_M025_M144';

router.get(
  '/health',
  (req,res) => {
    res.json({
      ok: true,

      fabric:
        'CIWU_SOVEREIGN_INTELLIGENCE_FABRIC',

      generation:
        'OMEGA120_M025_M144',

      marker,

      boundaries: {
        productionShell:
          false,

        productionAiFilesystemMutation:
          false,

        autonomousGitPush:
          false,

        autonomousPurchase:
          false,

        silentPaidFallback:
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
