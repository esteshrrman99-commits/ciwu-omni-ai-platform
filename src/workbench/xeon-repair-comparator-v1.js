'use strict';

function compare({
  baseline=[],
  candidate=[]
}={}) {
  const byKey=
    items =>
      new Map(
        items.map(
          item => [
            `${item.mode}:${item.file}`,
            item
          ]
        )
      );

  const before=
    byKey(baseline);

  const after=
    byKey(candidate);

  const keys=[
    ...new Set([
      ...before.keys(),
      ...after.keys()
    ])
  ];

  const comparisons=
    keys.map(key => {
      const a=before.get(key);
      const b=after.get(key);

      return {
        key,
        baselinePassed:
          a?.passed ?? null,
        candidatePassed:
          b?.passed ?? null,
        improved:
          a?.passed === false &&
          b?.passed === true,
        regressed:
          a?.passed === true &&
          b?.passed === false
      };
    });

  return {
    ok:true,
    comparisonCount:
      comparisons.length,
    improvedCount:
      comparisons.filter(
        x => x.improved
      ).length,
    regressionCount:
      comparisons.filter(
        x => x.regressed
      ).length,
    candidateAcceptable:
      comparisons.every(
        x => !x.regressed
      ),
    comparisons
  };
}

module.exports={compare};
