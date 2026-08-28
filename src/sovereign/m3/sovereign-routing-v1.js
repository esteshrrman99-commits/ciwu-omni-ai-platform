'use strict';

function rank(entries) {
  return [...(entries || [])]
    .filter(
      entry =>
        entry.runtimeEligible ===
        true
    )
    .sort(
      (a,b) =>
        Number(
          b.runtimeScore || 0
        ) -
        Number(
          a.runtimeScore || 0
        )
    );
}

function route({
  entries,
  preferredProvider,
  attempted = []
}) {
  const used =
    new Set(attempted);

  const eligible =
    rank(entries)
      .filter(
        entry =>
          !used.has(
            `${entry.provider}::${entry.model}`
          )
      );

  if (
    preferredProvider
  ) {
    const preferred =
      eligible.find(
        entry =>
          entry.provider ===
          preferredProvider
      );

    if (preferred) {
      return {
        routed: true,
        reason:
          'PREFERRED_CERTIFIED_PROVIDER',

        entry:
          preferred
      };
    }
  }

  const first =
    eligible[0];

  if (!first) {
    return {
      routed: false,
      reason:
        'NO_CERTIFIED_PROVIDER',

      entry:
        null
    };
  }

  return {
    routed: true,
    reason:
      'BEST_CERTIFIED_PROVIDER',

    entry:
      first
  };
}

function executionBoundary() {
  return {
    m3ChatRouting:
      'CERTIFIED_PROVIDER_ONLY',

    m3Execute:
      false,

    productionFilesystemMutation:
      false,

    autonomousGitPush:
      false
  };
}

module.exports = {
  rank,
  route,
  executionBoundary
};
