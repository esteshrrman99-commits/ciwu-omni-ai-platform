'use strict';

const { requestJson } = require('./http');

function configured() {
  return Boolean(
    process.env.CIWU_LOCAL_MODEL_ENDPOINT
  );
}

async function chat({
  model,
  messages,
  maxTokens = 1024
}) {
  if (!configured())
    throw new Error('LOCAL_UNCONFIGURED');

  model =
    model ||
    process.env.CIWU_LOCAL_MODEL;

  if (!model)
    throw new Error(
      'LOCAL_MODEL_REQUIRED'
    );

  let base =
    process.env.CIWU_LOCAL_MODEL_ENDPOINT;

  base = base.replace(/\/+$/, '');

  const { data } = await requestJson(
    `${base}/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body: {
        model,
        messages,
        max_tokens: maxTokens
      }
    }
  );

  return {
    provider: 'local',
    model,
    text:
      data?.choices?.[0]
        ?.message?.content || '',
    usage:
      data?.usage || null
  };
}

module.exports = {
  id: 'local',
  configured,
  chat
};
