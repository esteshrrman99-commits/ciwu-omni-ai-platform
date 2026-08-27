'use strict';

async function repairLoop({
  propose,
  apply,
  test,
  maxAttempts = 3
}) {
  if (
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > 10
  ) {
    throw new RangeError(
      'INVALID_MAX_ATTEMPTS'
    );
  }

  const evidence = [];

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const proposal =
      await propose({
        attempt,
        previous:
          evidence[
            evidence.length - 1
          ] || null
      });

    const applied =
      await apply(
        proposal
      );

    const result =
      await test();

    evidence.push({
      attempt,
      proposal,
      applied,
      result
    });

    if (
      result &&
      result.passed === true
    ) {
      return {
        passed: true,
        attempts: attempt,
        evidence
      };
    }
  }

  return {
    passed: false,
    attempts: maxAttempts,
    evidence
  };
}

module.exports = {
  repairLoop
};
