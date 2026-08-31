'use strict';

const fs = require('node:fs');
const path = require('node:path');

const POLICIES =
  new Set([
    'node-check',
    'node-test',
    'npm-test'
  ]);

function within(root, candidate) {
  const relative =
    path.relative(
      root,
      candidate
    );

  return (
    relative === '' ||
    (
      !relative.startsWith(
        '..' + path.sep
      ) &&
      relative !== '..' &&
      !path.isAbsolute(
        relative
      )
    )
  );
}

function validateRelative(
  projectRoot,
  value
) {
  if (
    typeof value !== 'string'
  ) {
    throw new Error(
      'EXECUTION_ARGUMENT_INVALID'
    );
  }

  if (
    value.includes('\0')
  ) {
    throw new Error(
      'EXECUTION_ARGUMENT_NUL_BLOCKED'
    );
  }

  if (
    path.isAbsolute(value)
  ) {
    throw new Error(
      'EXECUTION_ABSOLUTE_PATH_BLOCKED'
    );
  }

  const parts =
    value.split(/[\\/]+/);

  if (
    parts.includes('..')
  ) {
    throw new Error(
      'EXECUTION_PATH_TRAVERSAL_BLOCKED'
    );
  }

  const root =
    fs.realpathSync(
      projectRoot
    );

  const candidate =
    path.resolve(
      root,
      value
    );

  if (
    !within(
      root,
      candidate
    )
  ) {
    throw new Error(
      'EXECUTION_PATH_ESCAPE_BLOCKED'
    );
  }

  if (
    fs.existsSync(candidate)
  ) {
    const real =
      fs.realpathSync(
        candidate
      );

    if (
      !within(
        root,
        real
      )
    ) {
      throw new Error(
        'EXECUTION_SYMLINK_ESCAPE_BLOCKED'
      );
    }
  }

  return true;
}

function guardExecutionRequest(
  projectRoot,
  request
) {
  if (
    !request ||
    typeof request !== 'object'
  ) {
    throw new Error(
      'EXECUTION_REQUEST_REQUIRED'
    );
  }

  if (
    !POLICIES.has(
      request.policy
    )
  ) {
    throw new Error(
      'EXECUTION_POLICY_BLOCKED'
    );
  }

  const args =
    Array.isArray(
      request.args
    )
      ? request.args
      : [];

  for (
    const arg of args
  ) {
    if (
      typeof arg !== 'string'
    ) {
      throw new Error(
        'EXECUTION_ARGUMENT_INVALID'
      );
    }

    if (
      path.isAbsolute(arg)
    ) {
      throw new Error(
        'EXECUTION_ABSOLUTE_PATH_BLOCKED'
      );
    }

    if (
      arg
        .split(/[\\/]+/)
        .includes('..')
    ) {
      throw new Error(
        'EXECUTION_PATH_TRAVERSAL_BLOCKED'
      );
    }
  }

  if (
    request.policy ===
    'node-check'
  ) {
    if (
      args.length !== 1
    ) {
      throw new Error(
        'NODE_CHECK_REQUIRES_ONE_PATH'
      );
    }

    validateRelative(
      projectRoot,
      args[0]
    );
  }

  if (
    request.policy ===
    'node-test'
  ) {
    for (
      const arg of args
    ) {
      if (
        arg.startsWith('-')
      ) {
        continue;
      }

      validateRelative(
        projectRoot,
        arg
      );
    }
  }

  return true;
}

module.exports = {
  guardExecutionRequest
};
