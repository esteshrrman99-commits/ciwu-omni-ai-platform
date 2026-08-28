'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {
  spawnSync
}=require('node:child_process');

const policy=
  require('./xeon-sandbox-policy-v1');

const MAX_RUNS=24;
const MAX_OUTPUT_CHARS=12000;
const TIMEOUT_MS=20000;

function executeNode({
  workspace,
  file,
  mode='check'
}) {
  const rel=
    policy.assertSafeRelative(
      file
    );

  if (
    !rel.endsWith('.js')
  ) {
    throw new Error(
      'XEON_VALIDATOR_JS_ONLY'
    );
  }

  const root=
    path.resolve(workspace);

  const absolute=
    path.resolve(
      workspace,
      rel
    );

  if (
    !absolute.startsWith(
      root + path.sep
    )
  ) {
    throw new Error(
      'XEON_VALIDATOR_ESCAPE'
    );
  }

  if (
    !fs.existsSync(absolute)
  ) {
    throw new Error(
      'XEON_VALIDATOR_FILE_MISSING'
    );
  }

  const args=
    mode === 'check'
      ? ['--check',absolute]
      : mode === 'test'
        ? [absolute]
        : null;

  if (!args) {
    throw new Error(
      'XEON_VALIDATOR_MODE_DENIED'
    );
  }

  const result=
    spawnSync(
      process.execPath,
      args,
      {
        cwd:workspace,
        encoding:'utf8',
        timeout:TIMEOUT_MS,
        shell:false,
        env:{
          PATH:
            process.env.PATH || '',
          HOME:workspace,
          TMPDIR:workspace,
          NODE_ENV:'test'
        }
      }
    );

  return {
    file:rel,
    mode,
    status:
      result.status,
    signal:
      result.signal || null,
    timedOut:
      result.error?.code ===
        'ETIMEDOUT',
    stdout:
      String(
        result.stdout || ''
      ).slice(
        0,
        MAX_OUTPUT_CHARS
      ),
    stderr:
      String(
        result.stderr || ''
      ).slice(
        0,
        MAX_OUTPUT_CHARS
      ),
    passed:
      result.status === 0
  };
}

function validate({
  workspace,
  checks=[]
}={}) {
  if (
    !Array.isArray(checks) ||
    checks.length === 0 ||
    checks.length > MAX_RUNS
  ) {
    throw new Error(
      'XEON_VALIDATION_CHECK_COUNT_INVALID'
    );
  }

  const results=
    checks.map(
      check =>
        executeNode({
          workspace,
          file:check.file,
          mode:check.mode || 'check'
        })
    );

  return {
    ok:
      results.every(
        item => item.passed
      ),
    sandboxExecution:true,
    arbitraryShell:false,
    shellFalse:true,
    commandAllowlist:[
      'node --check <selected.js>',
      'node <selected-test.js>'
    ],
    results,
    productionExecution:false,
    productionMutation:false
  };
}

module.exports={
  MAX_RUNS,
  MAX_OUTPUT_CHARS,
  TIMEOUT_MS,
  executeNode,
  validate
};
