'use strict';

function sendJson(res, status, value) {
  const body = JSON.stringify(value);

  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });

  res.end(body);
}

function readJson(req, maxBytes = 262144) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on('data', chunk => {
      total += chunk.length;

      if (total > maxBytes) {
        reject(new Error('REQUEST_BODY_TOO_LARGE'));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');

        resolve(
          raw.length
            ? JSON.parse(raw)
            : {}
        );
      } catch (_) {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

module.exports = {
  sendJson,
  readJson
};
