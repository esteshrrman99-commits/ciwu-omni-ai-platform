'use strict';

const express = require('express');
const path = require('path');

const {
  eons,
  cortex,
  codex,
  vortex,
  zortex,
  neurotex,
  memortex,
  trustex,
  securex,
  evolvex
} = require('./eons');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    ...eons.status()
  });
});

router.get('/modules', (req, res) => {
  res.json({
    success: true,
    modules: [
      'EONS',
      'CORTEX',
      'CODEX',
      'VORTEX',
      'ZORTEX',
      'NEUROTEX',
      'MEMORTEX',
      'TRUSTEX',
      'SECUREX',
      'EVOLVEX'
    ]
  });
});

router.post('/cortex/classify', (req, res) => {
  const task = req.body?.task || '';
  res.json({
    success: true,
    result: cortex.classify(task)
  });
});

router.post('/codex/analyze', (req, res) => {
  const task = req.body?.task || '';
  res.json({
    success: true,
    result: codex.analyze(task)
  });
});

router.post('/vortex/verify', (req, res) => {
  const results = req.body?.results || [];
  res.json({
    success: true,
    result: vortex.verify(results)
  });
});

router.get('/zortex/policy', (req, res) => {
  res.json({
    success: true,
    result: zortex.discoveryPolicy()
  });
});

router.post('/neurotex/rank', (req, res) => {
  const models = req.body?.models || [];
  const requirements = req.body?.requirements || [];

  res.json({
    success: true,
    result: neurotex.rank(models, requirements)
  });
});

router.post('/trustex/provenance', (req, res) => {
  const source = req.body?.source || 'unknown';
  const metadata = req.body?.metadata || {};

  res.json({
    success: true,
    result: trustex.provenance(source, metadata)
  });
});

router.post('/securex/validate', (req, res) => {
  const model = req.body?.model || {};

  res.json({
    success: true,
    result: securex.validateModel(model)
  });
});

router.post('/evolvex/compare', (req, res) => {
  const current = req.body?.current || {};
  const candidate = req.body?.candidate || {};

  res.json({
    success: true,
    result: evolvex.evaluateUpgrade(current, candidate)
  });
});

module.exports = router;
