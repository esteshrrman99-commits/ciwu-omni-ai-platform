'use strict';

const { requestJson } = require('./http');

const BASE =
  'https://api.groq.com/openai/v1';

function configured() {
  return Boolean(process.env.GROQ_API_KEY);
}

async function models() {
  if (!configured())
    return {
      provider: 'groq',
      state: 'UNCONFIGURED',
      models: []
    };

  const { data } = await requestJson(
    `${BASE}/models`,
    {
      headers: {
        Authorization:
          `Bearer ${process.env.GROQ_API_KEY}`
      }
    }
  );

  return {
    provider: 'groq',
    state: 'AVAILABLE',
    models:
      Array.isArray(data.data)
        ? data.data.map(x => x.id)
        : []
  };
}

async function chat({
  model,
  messages,
  maxTokens = 1024
}) {
  if (!configured())
    throw new Error('GROQ_UNCONFIGURED');

  model =
    model ||
    process.env.GROQ_MODEL;

  if (!model)
    throw new Error('GROQ_MODEL_REQUIRED');

  const { data } = await requestJson(
    `${BASE}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type':
          'application/json'
      },
      body: {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.2
      }
    }
  );

  return {
    provider: 'groq',
    model,
    text:
      data?.choices?.[0]?.message?.content || '',
    usage:
      data?.usage || null
  };
}

module.exports = {
  id: 'groq',
  configured,
  models,
  chat
};
