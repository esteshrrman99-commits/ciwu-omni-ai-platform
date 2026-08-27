'use strict';

const { requestJson } = require('./http');

const ENDPOINT =
  'https://router.huggingface.co/v1/chat/completions';

function configured() {
  return Boolean(process.env.HF_TOKEN);
}

async function chat({
  model,
  messages,
  maxTokens = 1024
}) {
  if (!configured())
    throw new Error(
      'HUGGINGFACE_UNCONFIGURED'
    );

  model =
    model ||
    process.env.HF_MODEL;

  if (!model)
    throw new Error(
      'HF_MODEL_REQUIRED'
    );

  const { data } = await requestJson(
    ENDPOINT,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type':
          'application/json'
      },
      body: {
        model,
        messages,
        max_tokens: maxTokens,
        stream: false
      }
    }
  );

  return {
    provider: 'huggingface',
    model,
    text:
      data?.choices?.[0]
        ?.message?.content || '',
    usage:
      data?.usage || null
  };
}

module.exports = {
  id: 'huggingface',
  configured,
  chat
};
