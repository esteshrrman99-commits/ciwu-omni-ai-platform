'use strict';

async function requestJson(
  url,
  {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 90000
  } = {}
) {
  if (typeof fetch !== 'function')
    throw new Error('NODE_FETCH_UNAVAILABLE');

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const response = await fetch(url, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
      signal: controller.signal
    });

    const raw = await response.text();

    let data;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      const error = new Error(
        data?.error?.message ||
        data?.message ||
        raw ||
        `HTTP_${response.status}`
      );

      error.status = response.status;
      error.payload = data;

      throw error;
    }

    return {
      status: response.status,
      data
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  requestJson
};
