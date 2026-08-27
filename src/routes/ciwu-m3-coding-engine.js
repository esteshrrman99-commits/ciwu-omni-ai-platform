'use strict';

const express = require('express');
const crypto = require('crypto');

const {
  configured,
  respond,
  discoverModels,
  resetConversation,
  DEFAULT_MODEL
} = require('../m3-openai-service');

const router = express.Router();

/*
 * M3 owns its request-body boundary.
 *
 * The router may be mounted before application-wide body middleware,
 * so JSON parsing is enforced locally and does not depend on mount order.
 */
router.use(express.json({
  limit: '1mb'
}));


router.get('/health', async (req, res) => {
  res.json({
    ok: true,
    build: 'CIWU_M3_R3_JSON_BODY_PARSER_CERTIFIED',
    engine: 'M3_CODING_ENGINE',
    provider: 'OPENAI',
    api: 'RESPONSES',
    configured: configured(),
    default_model: DEFAULT_MODEL,

    capabilities: {
      conversation: true,
      code_generation: true,
      debugging: true,
      refactoring: true,
      architecture: true,
      test_generation: true,
      security_review: true,
      web_search_requestable: true,

      arbitrary_server_code_execution: false,
      arbitrary_filesystem_mutation: false,
      autonomous_git_push: false,
      autonomous_deployment: false
    }
  });
});

router.get('/models', async (req, res) => {
  if (!configured()) {
    return res.status(503).json({
      ok: false,
      error: 'OPENAI_API_KEY_NOT_CONFIGURED'
    });
  }

  try {
    const models = await discoverModels();

    res.json({
      ok: true,
      count: models.length,
      models
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: 'OPENAI_MODEL_DISCOVERY_FAILED',
      detail:
        error?.message || String(error)
    });
  }
});

router.post('/conversation', (req, res) => {
  res.json({
    ok: true,
    conversation_id:
      crypto.randomUUID()
  });
});

router.delete('/conversation/:id', (req, res) => {
  resetConversation(req.params.id);

  res.json({
    ok: true
  });
});

router.post('/chat', async (req, res) => {
  if (!configured()) {
    return res.status(503).json({
      ok: false,
      error: 'OPENAI_API_KEY_NOT_CONFIGURED'
    });
  }

  const message =
    String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({
      ok: false,
      error: 'MESSAGE_REQUIRED'
    });
  }

  if (message.length > 100000) {
    return res.status(413).json({
      ok: false,
      error: 'MESSAGE_TOO_LARGE'
    });
  }

  const conversationId =
    String(
      req.body?.conversation_id ||
      crypto.randomUUID()
    );

  const mode =
    String(req.body?.mode || 'CODE')
      .toUpperCase();

  const allowedModes =
    new Set([
      'CHAT',
      'CODE',
      'DEBUG',
      'REFACTOR',
      'ARCHITECT',
      'EXPLAIN',
      'TEST',
      'SECURITY_REVIEW'
    ]);

  if (!allowedModes.has(mode)) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_MODE'
    });
  }

  try {
    const result = await respond({
      message,
      conversationId,
      mode,
      webSearch:
        req.body?.web_search === true,
      model:
        req.body?.model ||
        DEFAULT_MODEL
    });

    res.json({
      ok: true,
      ...result
    });

  } catch (error) {
    console.error(
      '[M3 OPENAI]',
      error?.message || error
    );

    const status =
      error?.status &&
      Number.isInteger(error.status)
        ? error.status
        : 502;

    res.status(status).json({
      ok: false,
      error: 'M3_OPENAI_REQUEST_FAILED',
      detail:
        error?.message || String(error)
    });
  }
});

router.post('/execute', (req, res) => {
  res.status(403).json({
    ok: false,
    error:
      'ARBITRARY_SERVER_CODE_EXECUTION_DISABLED'
  });
});

module.exports = router;
