'use strict';

const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');

const policy=
  require('./xeon-sandbox-policy-v1');

function sha256(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
}

function build({
  root=process.cwd(),
  files=[]
}={}) {
  const selected=[
    ...new Set(
      files.map(
        policy.assertSafeRelative
      )
    )
  ];

  if (
    selected.length === 0 ||
    selected.length >
      policy.MAX_FILES
  ) {
    throw new Error(
      'XEON_FILE_SELECTION_INVALID'
    );
  }

  const workspace=
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-xeon-'
      )
    );

  const manifest=[];

  try {
    for (const rel of selected) {
      const source=
        path.resolve(root,rel);

      const rootResolved=
        path.resolve(root);

      if (
        !source.startsWith(
          rootResolved +
          path.sep
        )
      ) {
        throw new Error(
          'XEON_SOURCE_ESCAPE'
        );
      }

      const stat=
        fs.lstatSync(source);

      if (
        !stat.isFile() ||
        stat.isSymbolicLink()
      ) {
        throw new Error(
          'XEON_SOURCE_NOT_REGULAR_FILE'
        );
      }

      if (
        stat.size >
          policy.MAX_FILE_BYTES
      ) {
        throw new Error(
          'XEON_SOURCE_TOO_LARGE'
        );
      }

      const bytes=
        fs.readFileSync(source);

      const destination=
        path.join(
          workspace,
          ...rel.split('/')
        );

      fs.mkdirSync(
        path.dirname(destination),
        {recursive:true}
      );

      fs.writeFileSync(
        destination,
        bytes,
        {mode:0o600}
      );

      manifest.push({
        file:rel,
        bytes:bytes.length,
        sourceSha256:
          sha256(bytes),
        sandboxSha256:
          sha256(
            fs.readFileSync(
              destination
            )
          )
      });
    }

    return {
      ok:true,
      isolated:true,
      temporary:true,
      workspace,
      fileCount:
        manifest.length,
      manifest,
      productionMutation:false
    };

  } catch (error) {
    fs.rmSync(
      workspace,
      {
        recursive:true,
        force:true
      }
    );

    throw error;
  }
}

function destroy(workspace) {
  const target=
    path.resolve(
      String(workspace || '')
    );

  const tmp=
    path.resolve(
      os.tmpdir()
    );

  if (
    !target.startsWith(
      tmp + path.sep
    ) ||
    !path.basename(target)
      .startsWith(
        'ciwu-xeon-'
      )
  ) {
    throw new Error(
      'XEON_DESTROY_TARGET_DENIED'
    );
  }

  fs.rmSync(
    target,
    {
      recursive:true,
      force:true
    }
  );

  return {
    ok:true,
    destroyed:true
  };
}

module.exports={
  sha256,
  build,
  destroy
};
