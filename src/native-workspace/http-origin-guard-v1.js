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

  // CIWU_SAFE_PUBLIC_NAVIGATION_V2
  // A cross-site top-level browser navigation may load the exact
  // explicitly configured CIWU public host, but gains no API,
  // mutation, provider, tool, write or execution authority.
  if (site === 'cross-site') {
    const method =
      String(req.method || 'GET')
        .toUpperCase();

    const host =
      String(
        req.headers.host || ''
      )
        .trim()
        .toLowerCase()
        .split(':')[0];

    const mode =
      String(
        req.headers['sec-fetch-mode'] || ''
      ).toLowerCase();

    const destination =
      String(
        req.headers['sec-fetch-dest'] || ''
      ).toLowerCase();

    const allowedPublicHost =
      configuredPublicHost();

    const safePublicNavigation =
      Boolean(allowedPublicHost) &&
      host === allowedPublicHost &&
      (
        method === 'GET' ||
        method === 'HEAD'
      ) &&
      mode === 'navigate' &&
      destination === 'document';

    if (!safePublicNavigation) {
      throw new Error(
        'CROSS_SITE_REQUEST_BLOCKED'
      );
    }
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
