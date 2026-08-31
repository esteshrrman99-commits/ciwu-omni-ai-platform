'use strict';

function isLoopbackHost(hostname) {
  return (
    hostname === '127.0.0.1' ||
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

function normalizedHost(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
}

function configuredPublicHost() {
  return normalizedHost(
    process.env.CIWU_PUBLIC_HOST || ''
  );
}

function isExplicitPublicOrigin(parsed) {
  const allowed =
    configuredPublicHost();

  if (!allowed) {
    return false;
  }

  return (
    normalizedHost(parsed.hostname) ===
      allowed &&
    (
      parsed.protocol === 'https:' ||
      (
        process.env.CIWU_ALLOW_PUBLIC_HTTP ===
          '1' &&
        parsed.protocol === 'http:'
      )
    )
  );
}

function assertLoopbackOrigin(req) {
  const site =
    String(
      req.headers['sec-fetch-site'] || ''
    ).toLowerCase();

  if (site === 'cross-site') {
    throw new Error(
      'CROSS_SITE_REQUEST_BLOCKED'
    );
  }

  const origin =
    req.headers.origin;

  if (!origin) {
    return true;
  }

  let parsed;

  try {
    parsed =
      new URL(origin);
  } catch (_) {
    throw new Error(
      'INVALID_ORIGIN'
    );
  }

  if (
    isLoopbackHost(parsed.hostname)
  ) {
    return true;
  }

  if (
    isExplicitPublicOrigin(parsed)
  ) {
    return true;
  }

  throw new Error(
    'FOREIGN_ORIGIN_BLOCKED'
  );
}

module.exports = {
  isLoopbackHost,
  configuredPublicHost,
  isExplicitPublicOrigin,
  assertLoopbackOrigin
};
