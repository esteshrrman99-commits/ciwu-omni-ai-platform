'use strict';

const { requestJson } = require('./http');

function configured() {
  return Boolean(
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_ACCOUNT_ID
  );
}

async function chat({
  model,
  messages
}) {
  if (!configured())
    throw new Error('CLOUDFLARE_UNCONFIGURED');

  model =
    model ||
    process.env.CLOUDFLARE_MODEL;

  if (!model)
    throw new Error(
      'CLOUDFLARE_MODEL_REQUIRED'
    );

  const account =
    process.env.CLOUDFLARE_ACCOUNT_ID;

  const url =
    'https://api.cloudflare.com/client/v4/accounts/' +
    encodeURIComponent(account) +
    '/ai/run/' +
    model;

  const { data } = await requestJson(
    url,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type':
          'application/json'
      },
      body: {
        messages
      }
    }
  );

  const result =
    data?.result || {};

  const text =
    result.response ||
    result.result?.response ||
    '';

  return {
    provider: 'cloudflare',
    model,
    text: String(text),
    usage:
      result.usage || null
  };
}

module.exports = {
  id: 'cloudflare',
  configured,
  chat
};
