'use strict';

const {spawnSync}=require('node:child_process');

function git(args,{cwd=process.cwd()}={}) {
  const result=spawnSync(
    'git',
    args,
    {
      cwd,
      encoding:'utf8',
      shell:false,
      maxBuffer:4*1024*1024
    }
  );

  if (result.status!==0) {
    throw new Error(
      `GIT_FORENSIC_FAILED:${args.join(' ')}`
    );
  }

  return result.stdout.trim();
}

function commitsFor(pathname='public/index.html') {
  const raw=git([
    'log',
    '--follow',
    '--format=%H%x09%ct%x09%s',
    '--',
    pathname
  ]);

  if (!raw) return [];

  return raw.split('\n').map(line=>{
    const [sha,epoch,...subjectParts]=line.split('\t');

    return {
      sha,
      epoch:Number(epoch),
      subject:subjectParts.join('\t')
    };
  });
}

function showFile(sha,pathname) {
  const result=spawnSync(
    'git',
    ['show',`${sha}:${pathname}`],
    {
      cwd:process.cwd(),
      encoding:'utf8',
      shell:false,
      maxBuffer:8*1024*1024
    }
  );

  if (result.status!==0) {
    return null;
  }

  return result.stdout;
}

function locate({
  pathname='public/index.html'
}={}) {
  const commits=commitsFor(pathname);

  const sovereignSignals=[
    'One command center',
    'Sovereign Intelligence Fabric',
    'Command Center',
    'M3 Intelligence',
    'Model Federation',
    'CODEX / XEON'
  ];

  let transition=null;

  for (const item of commits) {
    const content=showFile(
      item.sha,
      pathname
    );

    if (!content) continue;

    const matches=sovereignSignals.filter(
      signal=>content.includes(signal)
    );

    if (matches.length>=2) {
      transition={
        ...item,
        matches
      };
    }
  }

  let originalCandidate=null;

  if (transition) {
    const parent=git([
      'rev-parse',
      `${transition.sha}^`
    ]);

    const parentContent=
      showFile(parent,pathname);

    if (parentContent) {
      originalCandidate={
        sha:parent,
        relation:
          'PARENT_OF_EARLIEST_SOVEREIGN_UI_TRANSITION'
      };
    }
  }

  if (!originalCandidate && commits.length>1) {
    originalCandidate={
      sha:
        commits[commits.length-1].sha,
      relation:
        'OLDEST_AVAILABLE_FRONTEND_REVISION'
    };
  }

  return {
    schema:
      'CIWU_ORIGINAL_PLATFORM_HISTORY_LOCATOR_V1',
    pathname,
    frontendRevisionCount:
      commits.length,
    sovereignTransition:
      transition,
    originalCandidate,
    currentHead:
      git(['rev-parse','HEAD']),
    mutationPerformed:false
  };
}

module.exports={
  git,
  commitsFor,
  showFile,
  locate
};
