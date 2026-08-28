'use strict';

const crypto =
  require('node:crypto');

const DEFAULT_TASKS =
  Object.freeze([
    {
      id:
        'exact-json',

      prompt:
        'Return JSON only: {"answer":4}',

      validate(text) {
        try {
          const x =
            JSON.parse(text);

          return (
            x.answer === 4
          );
        } catch {
          return false;
        }
      }
    },

    {
      id:
        'code-repair',

      prompt:
        'Return only JavaScript replacing `const x = ;` with valid code setting x to 1.',

      validate(text) {
        return (
          /const\s+x\s*=\s*1\s*;?/
            .test(text)
        );
      }
    },

    {
      id:
        'constraint-following',

      prompt:
        'Reply with exactly CIWU-CONSTRAINT-PASS',

      validate(text) {
        return (
          String(text)
            .trim() ===
          'CIWU-CONSTRAINT-PASS'
        );
      }
    }
  ]);

async function run({
  provider,
  infer,
  tasks =
    DEFAULT_TASKS
}) {
  const campaignId =
    crypto.randomUUID();

  const results = [];

  for (
    const task of tasks
  ) {
    const started =
      Date.now();

    const response =
      await infer({
        provider,
        messages: [
          {
            role: 'user',
            content:
              task.prompt
          }
        ]
      });

    const elapsedMs =
      Date.now() -
      started;

    const text =
      response?.text || '';

    results.push({
      task:
        task.id,

      passed:
        task.validate(text),

      elapsedMs,

      responseHash:
        crypto
          .createHash('sha256')
          .update(
            String(text)
          )
          .digest('hex')
    });
  }

  const passed =
    results.filter(
      x => x.passed
    ).length;

  return {
    campaignId,
    provider,
    passed,
    total:
      results.length,

    score:
      results.length
        ? passed /
          results.length
        : 0,

    results
  };
}

module.exports = {
  DEFAULT_TASKS,
  run
};
