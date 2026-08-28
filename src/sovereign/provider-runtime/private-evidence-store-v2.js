'use strict';

const fs =
  require('node:fs');

const path =
  require('node:path');

function safeId(value) {
  const id =
    String(value || '');

  if (
    !/^[A-Za-z0-9._-]+$/
      .test(id)
  ) {
    throw new Error(
      'EVIDENCE_ID_INVALID'
    );
  }

  return id;
}

function createStore(
  root
) {
  if (!root) {
    throw new Error(
      'PRIVATE_ROOT_REQUIRED'
    );
  }

  const resolved =
    path.resolve(root);

  fs.mkdirSync(
    resolved,
    {
      recursive: true,
      mode: 0o700
    }
  );

  function write(
    id,
    record
  ) {
    const name =
      safeId(id) + '.json';

    const target =
      path.resolve(
        resolved,
        name
      );

    if (
      path.dirname(target) !==
      resolved
    ) {
      throw new Error(
        'PATH_ESCAPE_BLOCKED'
      );
    }

    fs.writeFileSync(
      target,
      JSON.stringify(
        record,
        null,
        2
      ),
      {
        encoding: 'utf8',
        mode: 0o600
      }
    );

    return target;
  }

  function read(id) {
    const name =
      safeId(id) + '.json';

    const target =
      path.resolve(
        resolved,
        name
      );

    if (
      path.dirname(target) !==
      resolved
    ) {
      throw new Error(
        'PATH_ESCAPE_BLOCKED'
      );
    }

    return JSON.parse(
      fs.readFileSync(
        target,
        'utf8'
      )
    );
  }

  return {
    root: resolved,
    write,
    read
  };
}

module.exports = {
  safeId,
  createStore
};
