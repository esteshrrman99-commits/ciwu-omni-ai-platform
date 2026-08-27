'use strict';

const { requestJson } = require('./http');

const BASE =
  'https://generativelanguage.googleapis.com/v1beta';

function key() {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ''
  );
}

function configured() {
  return Boolean(key());
}

async function chat({
  model,
  messages
}) {
  if (!configured())
    throw new Error('GEMINI_UNCONFIGURED');

  model =
    model ||
    process.env.GEMINI_MODEL ||
    'gemini-3.7-flash';

  const contents = messages.map(m => ({
    role:
      m.role === 'assistant'
        ? 'model'
        : 'user',
    parts: [
      {
        text: String(m.content || '')
      }
    ]
  }));

  const url =
    `${BASE}/models/` +
    `${encodeURIComponent(model)}` +
    ':generateContent';

  const { data } = await requestJson(
    url,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': key(),
        'Content-Type':
          'application/json'
      },
      body: {
        contents
      }
    }
  );

  const text =
    data?.candidates?.[0]
      ?.content?.parts
      ?.map(p => p.text || '')
      .join('') || '';

  return {
    provider: 'gemini',
    model,
    text,
    usage:
      data?.usageMetadata || null
  };
}

module.exports = {
  id: 'gemini',
  configured,
  chat
};
