'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  spawnSync
} = require('node:child_process');

const ALLOWED = Object.freeze({
  NODE_CHECK: file => ({
    command: process.execPath,
    args: ['--check', file]
  }),

  NODE_TEST: file => ({
    command: process.execPath,
    args: ['--test', file]
  }),

  NODE_RUN: file => ({
    command: process.execPath,
    args: [file]
  })
});

function safeRelative(value) {
  const normalized =
    path.normalize(value);

  if (
    path.isAbsolute(normalized) ||
    normalized.startsWith('..') ||
    normalized.includes(
      `..${path.sep}`
    )
  ) {
    throw new Error(
      'XEON_PATH_ESCAPE_BLOCKED'
    );
  }

  return normalized;
}

function createWorkspace({
  projectRoot,
  files
}) {
  projectRoot =
    path.resolve(projectRoot);

  const workspace =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-xeon-'
      )
    );

  for (const input of files) {
    const relative =
      safeRelative(input);

    const source =
      path.join(
        projectRoot,
        relative
      );

    const realSource =
      fs.realpathSync(source);

    if (
      !realSource.startsWith(
        projectRoot + path.sep
      )
    ) {
      throw new Error(
        'XEON_SOURCE_ESCAPE_BLOCKED'
      );
    }

    const stat =
      fs.lstatSync(source);

    if (stat.isSymbolicLink())
      throw new Error(
        'XEON_SYMLINK_BLOCKED'
      );

    if (!stat.isFile())
      throw new Error(
        'XEON_FILES_ONLY'
      );

    const destination =
      path.join(
        workspace,
        relative
      );

    fs.mkdirSync(
      path.dirname(destination),
      { recursive: true }
    );

    fs.copyFileSync(
      source,
      destination
    );
  }

  return workspace;
}

function execute({
  workspace,
  operation,
  file,
  timeoutMs = 30000
}) {
  if (!(operation in ALLOWED))
    throw new Error(
      'XEON_OPERATION_BLOCKED'
    );

  const relative =
    safeRelative(file);

  const absolute =
    path.join(
      workspace,
      relative
    );

  if (!fs.existsSync(absolute))
    throw new Error(
      'XEON_FILE_NOT_FOUND'
    );

  const spec =
    ALLOWED[operation](relative);

  const result =
    spawnSync(
      spec.command,
      spec.args,
      {
        cwd: workspace,
        encoding: 'utf8',
        timeout: timeoutMs,
        shell: false,
        env: {
          PATH:
            process.env.PATH || '',
          HOME:
            workspace,
          NODE_ENV:
            'test'
        }
      }
    );

  return {
    operation,
    status:
      result.status,
    signal:
      result.signal || null,
    stdout:
      result.stdout || '',
    stderr:
      result.stderr || '',
    passed:
      result.status === 0
  };
}

function destroy(workspace) {
  fs.rmSync(
    workspace,
    {
      recursive: true,
      force: true
    }
  );
}

module.exports = {
  createWorkspace,
  execute,
  destroy
};
