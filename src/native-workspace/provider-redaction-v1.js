'use strict';

const SECRET_PATTERN =
  /(api[_-]?key|secret|token|password|authorization|credential|client[_-]?secret)/i;

function redactValue(
  value,
  key = ''
) {
  if (
    SECRET_PATTERN.test(
      String(key)
    )
  ) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map(
      item =>
        redactValue(
          item
        )
    );
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const out = {};

    for (
      const [childKey,child] of
      Object.entries(value)
    ) {
      out[childKey] =
        redactValue(
          child,
          childKey
        );
    }

    return out;
  }

  return value;
}

function assertNoSecretMaterial(
  value
) {
  const text =
    JSON.stringify(value);

  if (
    /Bearer\s+[A-Za-z0-9._-]+/i
      .test(text)
  ) {
    throw new Error(
      'PROVIDER_SECRET_MATERIAL_DETECTED'
    );
  }

  return true;
}

module.exports = {
  redactValue,
  assertNoSecretMaterial
};
