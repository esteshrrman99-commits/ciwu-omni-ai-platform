'use strict';

const fs =
  require('node:fs');

const path =
  require('node:path');

function append(
  file,
  record
) {
  const target =
    path.resolve(file);

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
      mode: 0o700
    }
  );

  fs.appendFileSync(
    target,
    JSON.stringify(record) +
    '\n',
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(
    target,
    0o600
  );
}

function read(file) {
  if (!fs.existsSync(file))
    return [];

  return fs
    .readFileSync(
      file,
      'utf8'
    )
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
}

module.exports = {
  append,
  read
};
