'use strict';

const fs=require('node:fs');
const path=require('node:path');

function loadReleases(
  root=process.cwd()
) {
  const dir=
    path.join(
      root,
      'data',
      'sovereign'
    );

  if (!fs.existsSync(dir))
    return [];

  return fs.readdirSync(dir)
    .filter(
      name =>
        /^omega120-m\d+-m\d+\.json$/
          .test(name)
    )
    .map(name => {
      try {
        const data=
          JSON.parse(
            fs.readFileSync(
              path.join(dir,name),
              'utf8'
            )
          );

        return {
          file:name,
          data
        };
      } catch (_) {
        return null;
      }
    })
    .filter(Boolean)
    .filter(
      item =>
        Number.isInteger(
          item.data.milestoneEnd
        )
    )
    .sort(
      (a,b) =>
        a.data.milestoneEnd -
        b.data.milestoneEnd
    );
}

function summarize(item) {
  const data=item.data;

  return {
    file:item.file,
    schema:data.schema || null,
    generation:data.generation || null,
    marker:data.marker || null,
    milestoneStart:
      data.milestoneStart || null,
    milestoneEnd:
      data.milestoneEnd || null,
    milestoneCount:
      data.milestoneCount || null,
    focus:data.focus || null
  };
}

function compare(
  root,
  fromEnd,
  toEnd
) {
  const releases=
    loadReleases(root);

  const from=
    releases.find(
      item =>
        item.data.milestoneEnd ===
        Number(fromEnd)
    );

  const to=
    releases.find(
      item =>
        item.data.milestoneEnd ===
        Number(toEnd)
    );

  if (!from || !to)
    throw new Error('RELEASE_NOT_FOUND');

  const fromKeys=
    new Set(
      Object.keys(from.data)
    );

  const toKeys=
    new Set(
      Object.keys(to.data)
    );

  const addedKeys=[
    ...toKeys
  ].filter(
    key =>
      !fromKeys.has(key)
  ).sort();

  const removedKeys=[
    ...fromKeys
  ].filter(
    key =>
      !toKeys.has(key)
  ).sort();

  const changedKeys=[
    ...fromKeys
  ].filter(
    key =>
      toKeys.has(key) &&
      JSON.stringify(from.data[key]) !==
      JSON.stringify(to.data[key])
  ).sort();

  return {
    ok:true,
    readOnly:true,
    from:summarize(from),
    to:summarize(to),
    addedKeys,
    removedKeys,
    changedKeys
  };
}

module.exports={
  loadReleases,
  summarize,
  compare
};
