'use strict';

const fs=require('node:fs');
const path=require('node:path');

function scan(root=process.cwd()) {
  const candidates=[
    path.join(root,'data','sovereign'),
    path.join(root,'data','frontend')
  ];

  const records=[];

  for (const dir of candidates) {
    if (!fs.existsSync(dir))
      continue;

    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.json'))
        continue;

      const lower=
        name.toLowerCase();

      if (
        !lower.includes('neurotex') &&
        !lower.includes('omega120')
      ) continue;

      try {
        const data=
          JSON.parse(
            fs.readFileSync(
              path.join(dir,name),
              'utf8'
            )
          );

        records.push({
          file:
            path.relative(
              root,
              path.join(dir,name)
            ).replaceAll('\\','/'),
          schema:
            data.schema || null,
          generation:
            data.generation || null,
          marker:
            data.marker || null,
          milestoneStart:
            Number.isInteger(
              data.milestoneStart
            )
              ? data.milestoneStart
              : null,
          milestoneEnd:
            Number.isInteger(
              data.milestoneEnd
            )
              ? data.milestoneEnd
              : null
        });
      } catch (_) {
        records.push({
          file:
            path.relative(
              root,
              path.join(dir,name)
            ).replaceAll('\\','/'),
          parseError:true
        });
      }
    }
  }

  return {
    ok:true,
    sourceCount:records.length,
    records:
      records.sort(
        (a,b) =>
          (b.milestoneEnd || 0) -
          (a.milestoneEnd || 0)
      )
  };
}

module.exports={scan};
