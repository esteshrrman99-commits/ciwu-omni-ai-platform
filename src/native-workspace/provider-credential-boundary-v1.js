'use strict';

function inspectCredentialPresence({
  envNames = [],
  env = process.env
} = {}) {
  const required =
    Array.isArray(envNames)
      ? [...new Set(envNames)]
      : [];

  const present =
    required.filter(name => {
      const value = env[name];

      return (
        typeof value === 'string' &&
        value.length > 0
      );
    });

  return {
    required:
      required.length > 0,
    required_count:
      required.length,
    present_count:
      present.length,
    all_present:
      required.length === 0 ||
      present.length ===
        required.length,
    credential_names:
      required,
    credential_values_exposed:
      false
  };
}

function assertCredentialReportSafe(
  report
) {
  if (
    !report ||
    report.credential_values_exposed !==
      false
  ) {
    throw new Error(
      'CREDENTIAL_REPORT_UNSAFE'
    );
  }

  for (
    const [key,value] of
    Object.entries(report)
  ) {
    if (
      /value|secret|token|password/i
        .test(key) &&
      typeof value === 'string'
    ) {
      throw new Error(
        'CREDENTIAL_VALUE_EXPOSURE'
      );
    }
  }

  return true;
}

module.exports = {
  inspectCredentialPresence,
  assertCredentialReportSafe
};
