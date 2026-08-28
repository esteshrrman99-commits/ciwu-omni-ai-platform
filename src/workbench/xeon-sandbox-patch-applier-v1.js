'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const policy=
  require('./xeon-sandbox-policy-v1');

function digest(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

function safeSandboxPath(
  workspace,
  rel
) {
  const file=
    policy.assertSafeRelative(rel);

  const root=
    path.resolve(workspace);

  const target=
    path.resolve(
      workspace,
      file
    );

  if (
    !target.startsWith(
      root + path.sep
    )
  ) {
    throw new Error(
      'XEON_PATCH_SANDBOX_ESCAPE'
    );
  }

  return target;
}

function apply({
  workspace,
  candidate
}={}) {
  if (
    !candidate ||
    candidate.schema !==
      'CIWU_CODEX_STRUCTURED_PATCH_V1' ||
    candidate.sandboxOnly !== true
  ) {
    throw new Error(
      'XEON_PATCH_CONTRACT_INVALID'
    );
  }

  const results=[];

  for (
    const raw of
    candidate.operations
  ) {
    const op=
      policy.assertPatchOperation(
        raw
      );

    const target=
      safeSandboxPath(
        workspace,
        op.file
      );

    const beforeText=
      fs.readFileSync(
        target,
        'utf8'
      );

    const occurrences=
      beforeText
        .split(op.before)
        .length - 1;

    if (occurrences !== 1) {
      throw new Error(
        occurrences === 0
          ? 'XEON_PATCH_ANCHOR_NOT_FOUND'
          : 'XEON_PATCH_ANCHOR_NOT_UNIQUE'
      );
    }

    const afterText=
      beforeText.replace(
        op.before,
        op.after
      );

    fs.writeFileSync(
      target,
      afterText,
      {
        encoding:'utf8',
        mode:0o600
      }
    );

    results.push({
      file:op.file,
      beforeSha256:
        digest(beforeText),
      afterSha256:
        digest(afterText),
      changed:
        beforeText !== afterText
    });
  }

  return {
    ok:true,
    sandboxOnly:true,
    applied:true,
    operationCount:
      results.length,
    results,
    productionMutation:false,
    gitMutation:false
  };
}

module.exports={
  digest,
  safeSandboxPath,
  apply
};
