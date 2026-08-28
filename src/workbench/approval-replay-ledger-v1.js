'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

function safeLedgerRoot(
  root=process.cwd(),
  ledgerDir
) {
  const repo=
    path.resolve(root);

  const privateRoot=
    path.resolve(
      root,
      '.ciwu-private',
      'approval-ledger'
    );

  const target=
    path.resolve(
      ledgerDir ||
      privateRoot
    );

  if (
    !target.startsWith(
      privateRoot
    )
  ) {
    throw new Error(
      'APPROVAL_LEDGER_PATH_DENIED'
    );
  }

  if (
    !privateRoot.startsWith(
      repo + path.sep
    )
  ) {
    throw new Error(
      'APPROVAL_LEDGER_ROOT_INVALID'
    );
  }

  return target;
}

function keyFor(jti) {
  return crypto
    .createHash('sha256')
    .update(
      String(jti)
    )
    .digest('hex');
}

function consume({
  root=process.cwd(),
  ledgerDir,
  jti,
  proposalId,
  exp,
  now=Math.floor(
    Date.now() / 1000
  )
}={}) {
  if (
    typeof jti !== 'string' ||
    !jti
  ) {
    throw new Error(
      'APPROVAL_JTI_REQUIRED'
    );
  }

  if (
    now >= Number(exp)
  ) {
    throw new Error(
      'APPROVAL_REPLAY_LEDGER_EXPIRED'
    );
  }

  const dir=
    safeLedgerRoot(
      root,
      ledgerDir
    );

  fs.mkdirSync(
    dir,
    {
      recursive:true,
      mode:0o700
    }
  );

  const file=
    path.join(
      dir,
      `${keyFor(jti)}.json`
    );

  const body=
    JSON.stringify(
      {
        schema:
          'CIWU_APPROVAL_REPLAY_RECORD_V1',
        proposalId,
        jtiHash:
          keyFor(jti),
        exp,
        consumedAt:now
      },
      null,
      2
    );

  try {
    const fd=
      fs.openSync(
        file,
        'wx',
        0o600
      );

    try {
      fs.writeFileSync(
        fd,
        body,
        'utf8'
      );
    } finally {
      fs.closeSync(fd);
    }

  } catch (error) {
    if (
      error &&
      error.code === 'EEXIST'
    ) {
      throw new Error(
        'APPROVAL_TOKEN_REPLAY'
      );
    }

    throw error;
  }

  return {
    consumed:true,
    recordPath:file
  };
}

module.exports={
  safeLedgerRoot,
  keyFor,
  consume
};
