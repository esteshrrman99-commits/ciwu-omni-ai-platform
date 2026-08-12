'use strict';

const express = require('express');
const AbijahEngine =
  require('../services/abijah-engine');

const router = express.Router();
const abijah = new AbijahEngine();

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    abijah: abijah.status()
  });
});

router.post('/', async (req, res) => {
  try {
    const message =
      req.body?.message ||
      req.body?.text ||
      '';

    const result =
      await abijah.process(message);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error(
      'ABIJAH_CHAT_ERROR',
      error
    );

    res.status(500).json({
      success: false,
      response:
        "I hit a technical problem, darling. Please try again.",
      readAloud: false
    });
  }
});

module.exports = router;
