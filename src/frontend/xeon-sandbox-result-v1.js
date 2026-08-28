'use strict';

function normalize(result={}) {
  const exitCode=Number(result.exitCode);

  const timedOut=
    result.timedOut === true;

  const passed=
    Number.isInteger(exitCode) &&
    exitCode === 0 &&
    timedOut !== true;

  return {
    command:String(result.command || ''),
    exitCode:
      Number.isInteger(exitCode)
        ? exitCode
        : null,
    timedOut,
    passed,
    stdout:
      typeof result.stdout === 'string'
        ? result.stdout
        : '',
    stderr:
      typeof result.stderr === 'string'
        ? result.stderr
        : '',
    durationMs:
      Number.isFinite(Number(result.durationMs))
        ? Math.max(0,Number(result.durationMs))
        : null,
    workspaceDestroyed:
      result.workspaceDestroyed === true
  };
}

module.exports={normalize};
