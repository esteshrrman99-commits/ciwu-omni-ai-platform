'use strict';

function normalizeSha(
  value
) {
  const sha =
    String(
      value || ''
    )
    .trim()
    .toLowerCase();

  if (
    !/^[0-9a-f]{40}$/.test(
      sha
    )
  ) {
    return null;
  }

  return sha;
}

function runtimeFingerprint(
  env = process.env
) {
  const commit =
    normalizeSha(
      env.RENDER_GIT_COMMIT
    );

  return {
    platform:
      env.RENDER === 'true'
        ? 'RENDER'
        : 'LOCAL_OR_OTHER',

    gitCommit:
      commit,

    gitBranch:
      env.RENDER_GIT_BRANCH ||
      null,

    repository:
      env.RENDER_GIT_REPO_SLUG ||
      null,

    serviceId:
      env.RENDER_SERVICE_ID ||
      null,

    exactCommitAvailable:
      commit !== null
  };
}

function certify({
  expectedCommit,
  runtimeCommit
}) {
  const expected =
    normalizeSha(
      expectedCommit
    );

  const actual =
    normalizeSha(
      runtimeCommit
    );

  if (!expected) {
    return {
      certified: false,
      reason:
        'EXPECTED_COMMIT_INVALID'
    };
  }

  if (!actual) {
    return {
      certified: false,
      reason:
        'RUNTIME_COMMIT_UNAVAILABLE'
    };
  }

  if (expected !== actual) {
    return {
      certified: false,
      reason:
        'RUNTIME_COMMIT_MISMATCH'
    };
  }

  return {
    certified: true,
    reason:
      'EXACT_RUNTIME_COMMIT_MATCH'
  };
}

module.exports = {
  normalizeSha,
  runtimeFingerprint,
  certify
};
