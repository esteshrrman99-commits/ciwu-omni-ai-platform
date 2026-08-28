'use strict';

function build(
  providers
) {
  return [...providers]
    .filter(
      x =>
        x.runtimeEligible ===
          true &&
        x.available ===
          true &&
        x.demoted !==
          true
    )
    .sort(
      (a,b) =>
        Number(
          b.runtimeScore ||
          0
        ) -
        Number(
          a.runtimeScore ||
          0
        )
    )
    .map(
      (x,index) => ({
        order:
          index + 1,

        id:
          x.id,

        costClass:
          x.costClass,

        runtimeScore:
          Number(
            x.runtimeScore ||
            0
          )
      })
    );
}

function next({
  chain,
  attempted
}) {
  const used =
    new Set(
      attempted || []
    );

  return (
    chain.find(
      x =>
        !used.has(
          x.id
        )
    ) ||
    null
  );
}

function mayFallback(
  failureClass
) {
  return [
    'RATE_LIMITED',
    'TIMEOUT',
    'NETWORK_FAILURE',
    'TEMPORARY_PROVIDER_FAILURE',
    'BILLING_OR_QUOTA_BLOCKED'
  ].includes(
    failureClass
  );
}

module.exports = {
  build,
  next,
  mayFallback
};
