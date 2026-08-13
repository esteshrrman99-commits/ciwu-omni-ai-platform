'use strict';

const express =
  require('express');

const router =
  express.Router();

const intelligence =
  require('../eons/intelligence');

router.get(
  '/status',
  (req, res) =>
    res.json(
      intelligence.status()
    )
);

router.post(
  '/claims',
  (req, res) =>
    res.json({
      success: true,
      claim:
        intelligence.ledger.add(
          req.body?.sessionId ||
            'default',
          req.body?.claim || {}
        )
    })
);

router.get(
  '/claims/:sessionId',
  (req, res) =>
    res.json({
      success: true,
      claims:
        intelligence.ledger.list(
          req.params.sessionId
        )
    })
);

router.get(
  '/graph/:sessionId',
  (req, res) =>
    res.json({
      success: true,
      graph:
        intelligence.ledger
          .contextGraph(
            req.params.sessionId
          )
    })
);

router.post(
  '/lab-trend',
  (req, res) =>
    res.json({
      success: true,
      result:
        intelligence.analyzeTrend(
          req.body?.points || []
        )
    })
);

router.post(
  '/medications/assess',
  (req, res) =>
    res.json({
      success: true,
      result:
        intelligence
          .medicationReasoner
          .assess(
            req.body?.medications ||
              []
          )
    })
);

router.post(
  '/treatments/compare',
  (req, res) =>
    res.json({
      success: true,
      result:
        intelligence
          .treatmentCompare
          .compare(
            req.body?.options || [],
            req.body?.context || {}
          )
    })
);

router.post(
  '/timeline/:sessionId',
  (req, res) =>
    res.json({
      success: true,
      event:
        intelligence.timeline.add(
          req.params.sessionId,
          req.body || {}
        )
    })
);

router.get(
  '/timeline/:sessionId',
  (req, res) =>
    res.json({
      success: true,
      timeline:
        intelligence.timeline.list(
          req.params.sessionId
        )
    })
);

module.exports = router;
