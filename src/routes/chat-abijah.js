'use strict';

const express = require('express');
const crypto = require('crypto');

const AbijahEngine =
  require('../services/abijah-engine');

const router = express.Router();
const abijah = new AbijahEngine();

function sessionId(req) {
  const supplied =
    req.body?.sessionId ||
    req.headers['x-abijah-session'];

  if (
    typeof supplied === 'string' &&
    supplied.trim().length >= 4
  ) {
    return supplied.trim().slice(0, 128);
  }

  return crypto
    .randomBytes(16)
    .toString('hex');
}

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    abijah: abijah.status()
  });
});

router.post('/', async (req, res) => {
  try {
    const message =
      String(req.body?.message || '').trim();

    if (!message) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Message required'
        });
    }

    const id = sessionId(req);

    const result =
      await abijah.process({
        message,
        sessionId: id,

        context: req.body?.context || null
      });

    res.json(result);

  } catch (error) {
    console.error(
      '[ABIJAH ROUTE]',
      error
    );

    res
      .status(500)
      .json({
        success: false,

        response:
          "I hit a technical problem while processing that request. Please try again.",

        assistant: 'Abijah',

        readAloud: true,

        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : undefined
      });
  }
});

router.post('/reset', (req, res) => {
  const id =
    String(
      req.body?.sessionId || ''
    ).trim();

  if (id) {
    abijah.clear(id);
  }

  res.json({
    success: true,
    cleared: Boolean(id)
  });
});

module.exports = router;
