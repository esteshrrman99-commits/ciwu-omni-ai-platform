'use strict';

const express = require('express');

const {
  TRUTH_STATES,
  SOURCE_CLASSES,
  RELATIONSHIPS,
  buildClaim,
  buildGraph,
  resolveConflict
} =
  require(
    '../eons/intelligence/clinical-evidence-graph'
  );

const router = express.Router();

/*
 * M5.5 JSON boundary
 *
 * Parse JSON inside this router so the clinical-evidence
 * contract remains valid regardless of application-level
 * middleware ordering.
 */
router.use(
  express.json({
    limit: '2mb',
    strict: true
  })
);


router.get('/status', (req, res) => {
  res.json({
    success: true,
    milestone: 'M5.5',
    engine:
      'EONS Clinical Evidence Graph',
    truthStates:
      TRUTH_STATES,
    sourceClasses:
      SOURCE_CLASSES,
    relationships:
      RELATIONSHIPS,
    capabilities: {
      claimProvenance: true,
      contradictionResolution: true,
      confidenceCalibration: true,
      missingContextTracking: true,
      timelineSupport: true,
      patientSpecificFlagging: true
    }
  });
});

router.post('/claim', (req, res) => {
  try {
    res.json({
      success: true,
      claim:
        buildClaim(
          req.body || {}
        )
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error.message
    });
  }
});

router.post('/resolve-conflict', (req, res) => {
  try {
    const items =
      Array.isArray(req.body?.items)
        ? req.body.items
        : [];

    res.json({
      success: true,
      resolution:
        resolveConflict(items)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error.message
    });
  }
});

router.post('/graph', (req, res) => {
  try {
    res.json(
      buildGraph(
        req.body || {}
      )
    );
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error.message
    });
  }
});

module.exports = router;
