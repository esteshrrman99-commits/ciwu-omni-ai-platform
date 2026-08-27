'use strict';

const fs = require('node:fs');
const path = require('node:path');

function safe(
  workspace,
  relative
) {
  const root =
    path.resolve(workspace);

  const target =
    path.resolve(
      root,
      relative
    );

  if (
    target !== root &&
    !target.startsWith(
      root + path.sep
    )
  ) {
    throw new Error(
      'XEON_PATH_ESCAPE_BLOCKED'
    );
  }

  return target;
}

function replace({
  workspace,
  file,
  before,
  after
}) {
  const target =
    safe(
      workspace,
      file
    );

  const current =
    fs.readFileSync(
      target,
      'utf8'
    );

  const count =
    current
      .split(before)
      .length - 1;

  if (count !== 1) {
    throw new Error(
      `XEON_PATCH_MATCH_COUNT_${count}`
    );
  }

  fs.writeFileSync(
    target,
    current.replace(
      before,
      after
    ),
    'utf8'
  );

  return {
    file,
    changed: true
  };
}

function writeNew({
  workspace,
  file,
  content
}) {
  const target =
    safe(
      workspace,
      file
    );

  if (fs.existsSync(target)) {
    throw new Error(
      'XEON_NEW_FILE_ALREADY_EXISTS'
    );
  }

  fs.mkdirSync(
    path.dirname(target),
    { recursive: true }
  );

  fs.writeFileSync(
    target,
    String(content),
    'utf8'
  );

  return {
    file,
    created: true
  };
}

module.exports = {
  safe,
  replace,
  writeNew
};
