'use strict';

const fs=require('node:fs');
const path=require('node:path');

function readJson(file) {
  try {
    return JSON.parse(
      fs.readFileSync(file,'utf8')
    );
  } catch (_) {
    return null;
  }
}

function newestRelease(root) {
  const dir=path.join(
    root,
    'data',
    'sovereign'
  );

  if (!fs.existsSync(dir))
    return null;

  const items=fs.readdirSync(dir)
    .filter(name =>
      /^omega120-m\d+-m\d+\.json$/.test(name)
    )
    .map(name => ({
      name,
      data:readJson(
        path.join(dir,name)
      )
    }))
    .filter(item =>
      item.data &&
      Number.isInteger(
        item.data.milestoneEnd
      )
    )
    .sort(
      (a,b) =>
        b.data.milestoneEnd -
        a.data.milestoneEnd
    );

  return items[0] || null;
}

function snapshot(root=process.cwd()) {
  const latest=newestRelease(root);

  return {
    ok:true,
    project:'CIWU OMNI',
    runtimeEntry:'src/enhanced-api.js',
    environment:
      process.env.RENDER === 'true'
        ? 'RENDER'
        : 'LOCAL_OR_OTHER',
    renderGitCommit:
      process.env.RENDER_GIT_COMMIT ||
      process.env.GIT_COMMIT ||
      null,
    release:
      latest
        ? {
            file:latest.name,
            generation:
              latest.data.generation || null,
            marker:
              latest.data.marker || null,
            milestoneStart:
              latest.data.milestoneStart,
            milestoneEnd:
              latest.data.milestoneEnd,
            milestoneCount:
              latest.data.milestoneCount
          }
        : null,
    mutationAuthority:false,
    gitPushAuthority:false,
    purchaseAuthority:false,
    generatedAt:
      new Date().toISOString()
  };
}

module.exports={
  readJson,
  newestRelease,
  snapshot
};
