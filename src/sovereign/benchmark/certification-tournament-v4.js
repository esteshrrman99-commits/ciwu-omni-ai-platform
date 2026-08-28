'use strict';

async function run({
  candidates,
  executeCandidate,
  explicitAuthorization
}) {
  if (
    explicitAuthorization !== true
  ) {
    return {
      executed: false,
      reason:
        'EXPLICIT_AUTHORIZATION_REQUIRED',
      results: []
    };
  }

  if (
    typeof executeCandidate !==
    'function'
  ) {
    throw new Error(
      'EXECUTE_CANDIDATE_REQUIRED'
    );
  }

  const results = [];

  for (const candidate of candidates || []) {
    if (
      candidate?.admitted !== true
    ) {
      results.push({
        provider:
          candidate?.provider ||
          null,

        model:
          candidate?.model ||
          null,

        executed:
          false,

        reason:
          'CANDIDATE_NOT_ADMITTED'
      });

      continue;
    }

    try {
      const result =
        await executeCandidate(
          candidate
        );

      results.push({
        provider:
          candidate.provider,

        model:
          candidate.model,

        executed:
          true,

        result
      });

    } catch (error) {
      results.push({
        provider:
          candidate.provider,

        model:
          candidate.model,

        executed:
          true,

        error:
          String(
            error?.message ||
            error
          )
      });
    }
  }

  return {
    executed: true,
    results
  };
}

function successful(
  campaignResult
) {
  return (
    campaignResult?.results ||
    []
  ).filter(
    item =>
      item.executed === true &&
      !item.error &&
      item.result
  );
}

module.exports = {
  run,
  successful
};
