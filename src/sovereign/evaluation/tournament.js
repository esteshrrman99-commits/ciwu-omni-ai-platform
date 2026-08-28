'use strict';

const crypto =
  require('node:crypto');

async function run({
  providers,
  tasks,
  invoke
}) {
  const tournamentId =
    crypto.randomUUID();

  const rows = [];

  for (
    const provider of
    providers
  ) {
    let passed = 0;
    let totalMs = 0;

    for (
      const task of
      tasks
    ) {
      const started =
        Date.now();

      const result =
        await invoke({
          provider,
          task
        });

      const elapsedMs =
        Date.now() -
        started;

      totalMs +=
        elapsedMs;

      const ok =
        task.validate(
          result
        ) === true;

      if (ok)
        passed++;

      rows.push({
        provider:
          provider.id,
        task:
          task.id,
        passed:
          ok,
        elapsedMs
      });
    }

    provider.summary = {
      passed,
      total:
        tasks.length,
      accuracy:
        tasks.length
          ? passed /
            tasks.length
          : 0,
      averageLatencyMs:
        tasks.length
          ? totalMs /
            tasks.length
          : null
    };
  }

  return {
    tournamentId,
    providers:
      providers.map(
        p => ({
          id:
            p.id,
          summary:
            p.summary
        })
      ),
    rows
  };
}

module.exports = {
  run
};
