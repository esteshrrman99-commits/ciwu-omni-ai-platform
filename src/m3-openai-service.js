'use strict';

const OpenAI = require('openai');

const DEFAULT_MODEL =
  process.env.CIWU_M3_MODEL ||
  'gpt-5.6-sol';

const conversations = new Map();

function configured() {
  return Boolean(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.trim()
  );
}

function client() {
  if (!configured()) {
    const err = new Error(
      'OPENAI_API_KEY_NOT_CONFIGURED'
    );
    err.code = 'OPENAI_API_KEY_NOT_CONFIGURED';
    throw err;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const SYSTEM = `
You are CIWU OMNI M3 Coding Engine.

You are a professional software-engineering assistant.

Primary functions:
- design software architectures
- write production-quality code
- explain code
- diagnose bugs
- refactor safely
- generate tests
- reason about APIs
- review security boundaries
- create migration plans
- generate shell, JavaScript, TypeScript, Python, HTML, CSS,
  SQL, JSON, YAML and other appropriate engineering artifacts

Rules:
1. Never claim code was executed unless execution evidence exists.
2. Never claim a file changed unless a file-changing tool actually changed it.
3. Never claim deployment succeeded without deployment evidence.
4. Never invent credentials, secrets, API responses or test results.
5. Clearly distinguish proposed code from executed code.
6. Preserve existing systems unless the user explicitly requests replacement.
7. Prefer reversible changes and explicit validation.
8. Treat UNKNOWN as UNKNOWN, not success.
9. For destructive or externally consequential operations, require an
   explicit authorization boundary.
10. Produce complete copy/paste-ready code when requested.

This engine may have provider tools attached. Use only tools actually
provided in the current request. Never pretend unavailable tools exist.
`.trim();

function session(id) {
  if (!conversations.has(id)) {
    conversations.set(id, {
      previousResponseId: null,
      turns: 0,
      updatedAt: Date.now()
    });
  }

  return conversations.get(id);
}

function extractText(response) {
  if (
    typeof response.output_text === 'string' &&
    response.output_text.length
  ) {
    return response.output_text;
  }

  const chunks = [];

  for (const item of response.output || []) {
    if (item.type !== 'message') continue;

    for (const c of item.content || []) {
      if (
        c.type === 'output_text' &&
        typeof c.text === 'string'
      ) {
        chunks.push(c.text);
      }
    }
  }

  return chunks.join('\n');
}

async function respond({
  message,
  conversationId,
  mode = 'CODE',
  webSearch = false,
  model = DEFAULT_MODEL
}) {
  const ai = client();

  const state = session(conversationId);

  const request = {
    model,

    instructions:
      SYSTEM +
      `\n\nCurrent engineering mode: ${mode}`,

    input: message,

    reasoning: {
      effort: 'high'
    },

    text: {
      verbosity: 'high'
    },

    store: true
  };

  if (state.previousResponseId) {
    request.previous_response_id =
      state.previousResponseId;
  }

  if (webSearch) {
    request.tools = [
      {
        type: 'web_search'
      }
    ];
  }

  const response =
    await ai.responses.create(request);

  state.previousResponseId = response.id;
  state.turns += 1;
  state.updatedAt = Date.now();

  return {
    id: response.id,
    model: response.model || model,
    status: response.status,
    text: extractText(response),
    conversationId,
    turns: state.turns,
    usage: response.usage || null
  };
}

async function discoverModels() {
  const ai = client();

  const page = await ai.models.list();

  const models =
    (page.data || [])
      .map(x => x.id)
      .filter(Boolean)
      .sort();

  return models;
}

function resetConversation(id) {
  return conversations.delete(id);
}

module.exports = {
  configured,
  respond,
  discoverModels,
  resetConversation,
  DEFAULT_MODEL
};
