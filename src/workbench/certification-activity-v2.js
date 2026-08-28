'use strict';

const fs=require('node:fs');
const path=require('node:path');

function build(root=process.cwd()) {
  const dir=
    path.join(
      root,
      'data',
      'sovereign'
    );

  if (!fs.existsSync(dir)) {
    return {
      ok:true,
      events:[]
    };
  }

  const events=[];

  for (const name of fs.readdirSync(dir)) {
    if (
      !/^omega120-m\d+-m\d+\.json$/.test(name)
    ) continue;

    try {
      const data=
        JSON.parse(
          fs.readFileSync(
            path.join(dir,name),
            'utf8'
          )
        );

      if (
        !Number.isInteger(
          data.milestoneEnd
        )
      ) continue;

      events.push({
        id:
          `release-${data.milestoneEnd}`,
        type:'OMEGA120_RELEASE',
        summary:
          `${data.generation || name} certified artifact`,
        generation:
          data.generation || null,
        marker:
          data.marker || null,
        milestoneStart:
          data.milestoneStart || null,
        milestoneEnd:
          data.milestoneEnd,
        milestoneCount:
          data.milestoneCount || null
      });
    } catch (_) {}
  }

  events.sort(
    (a,b) =>
      b.milestoneEnd -
      a.milestoneEnd
  );

  return {
    ok:true,
    eventCount:events.length,
    events
  };
}

module.exports={build};
