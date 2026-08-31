'use strict';

const childProcess = require('node:child_process');
const path = require('node:path');

const {
  authorize
} = require('./authority-v1');

const {
  resolveInside
} = require('./path-guard-v1');

const {
  resolvePolicy
} = require('./execution-policy-v1');

function run(root, request = {}, grants = []) {
  const auth = authorize('EXECUTE', grants);

  if (!auth.ok) {
    return {
      ok: false,
      reason: 'EXECUTE_AUTHORIZATION_REQUIRED'
    };
  }

  const policy = resolvePolicy(request.policy);

  if (!policy) {
    return {
      ok: false,
      reason: 'EXECUTION_POLICY_DENIED'
    };
  }

  const cwd = resolveInside(
    root,
    request.cwd || '.'
  );

  const args = [
    ...policy.prefix,
    ...(Array.isArray(request.args)
      ? request.args.map(String)
      : [])
  ];

  const timeoutMs = Math.min(
    Math.max(
      Number(request.timeout_ms || 15000),
      100
    ),
    60000
  );

  const maxOutput = Math.min(
    Math.max(
      Number(request.max_output_bytes || 131072),
      1024
    ),
    1048576
  );

  const result = childProcess.spawnSync(
    policy.command,
    args,
    {
      cwd,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: maxOutput,
      env: {
        PATH: process.env.PATH || ''
      }
    }
  );

  return {
    ok:
      result.status === 0 &&
      !result.error,
    policy: request.policy,
    command: policy.command,
    args,
    cwd: path.relative(
      require('node:fs').realpathSync(root),
      cwd
    ) || '.',
    exit_code:
      typeof result.status === 'number'
        ? result.status
        : null,
    signal: result.signal || null,
    stdout: String(result.stdout || '').slice(0, maxOutput),
    stderr: String(result.stderr || '').slice(0, maxOutput),
    error:
      result.error
        ? String(result.error.message || result.error)
        : null
  };
}

module.exports = {
  run
};
