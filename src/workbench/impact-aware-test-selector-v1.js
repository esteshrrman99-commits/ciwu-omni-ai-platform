'use strict';

const path=require('node:path');

const xeon=
  require('./xeon-sandbox-policy-v1');

const policy=
  require('./autonomous-repair-search-policy-v1');

function stem(file) {
  return path.posix.basename(
    file,
    path.posix.extname(file)
  )
  .replace(
    /\.(test|spec)$/i,
    ''
  )
  .replace(
    /[-_.]+/g,
    ' '
  )
  .toLowerCase();
}

function tokens(file) {
  return new Set(
    stem(file)
      .split(/\s+/)
      .filter(
        token =>
          token.length >= 3
      )
  );
}

function overlap(a,b) {
  const aa=tokens(a);
  const bb=tokens(b);

  let score=0;

  for (const token of aa) {
    if (bb.has(token))
      score += 1;
  }

  return score;
}

function select({
  changedFiles=[],
  candidateTests=[]
}={}) {
  if (
    !Array.isArray(changedFiles) ||
    changedFiles.length === 0
  ) {
    throw new Error(
      'TEST_SELECTOR_CHANGED_FILES_REQUIRED'
    );
  }

  const safeChanged=
    changedFiles.map(
      xeon.assertSafeRelative
    );

  const safeTests=[
    ...new Set(
      candidateTests
        .map(
          xeon.assertSafeRelative
        )
        .filter(
          file =>
            file.startsWith('test/') &&
            file.endsWith('.js')
        )
    )
  ];

  const ranked=
    safeTests.map(file => {
      const score=
        safeChanged.reduce(
          (sum,changed) =>
            sum +
            overlap(
              changed,
              file
            ),
          0
        );

      return {
        file,
        impactScore:score,
        direct:
          safeChanged.includes(file)
      };
    })
    .sort(
      (a,b) =>
        Number(b.direct) -
          Number(a.direct) ||
        b.impactScore -
          a.impactScore ||
        a.file.localeCompare(
          b.file
        )
    )
    .slice(
      0,
      policy.MAX_TESTS
    );

  if (
    ranked.length === 0
  ) {
    throw new Error(
      'TEST_SELECTOR_NO_SAFE_TESTS'
    );
  }

  return {
    ok:true,
    readOnly:true,
    changedFiles:
      safeChanged,
    selectedTests:
      ranked,
    selectionCount:
      ranked.length,
    productionExecution:false
  };
}

module.exports={
  stem,
  tokens,
  overlap,
  select
};
