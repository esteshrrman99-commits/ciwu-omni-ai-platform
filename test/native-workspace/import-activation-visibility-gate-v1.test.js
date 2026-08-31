'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const fs =
  require('node:fs');

const os =
  require('node:os');

const path =
  require('node:path');

const {
  ImportActiveConversationStore
} =
  require(
    '../../src/native-workspace/import-active-conversation-store-v1'
  );

function tempRoot() {
  return fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-leap017-'
    )
  );
}

function sourceSha(ch = 'a') {
  return ch.repeat(64);
}

function writePayload(
  root,
  sha,
  name = 'c1.json',
  content = 'alpha'
) {
  const dir =
    path.join(root, sha);

  fs.mkdirSync(
    dir,
    {
      recursive:true
    }
  );

  fs.writeFileSync(
    path.join(dir, name),
    JSON.stringify({
      source_sha256:sha,
      external_id:'conversation-1',
      title:'Imported',
      import_authority:
        'READ_IMPORT_ONLY',
      imported_content_inert:true,
      tool_execution_allowed:false,
      mutation_authority:false,
      messages:[
        {
          id:'m1',
          role:'user',
          content
        }
      ]
    })
  );
}

test(
  'uncommitted physical import files remain invisible',
  () => {
    const root =
      tempRoot();

    try {
      const sha =
        sourceSha('a');

      writePayload(
        root,
        sha
      );

      const store =
        new ImportActiveConversationStore(
          root
        );

      assert.equal(
        store.all().length,
        0
      );

      console.log(
        'CIWU_IMPORT_UNCOMMITTED_INVISIBLE_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);

test(
  'prepared activation remains invisible until committed',
  () => {
    const root =
      tempRoot();

    try {
      const sha =
        sourceSha('b');

      writePayload(
        root,
        sha
      );

      const store =
        new ImportActiveConversationStore(
          root
        );

      store.prepareVisibility(
        sha
      );

      assert.equal(
        store.all().length,
        0
      );

      store.commitPreparedVisibility(
        sha
      );

      assert.equal(
        store.all().length,
        1
      );

      console.log(
        'CIWU_IMPORT_TWO_PHASE_VISIBILITY_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);

test(
  'post-commit imported content tampering fails closed',
  () => {
    const root =
      tempRoot();

    try {
      const sha =
        sourceSha('c');

      writePayload(
        root,
        sha,
        'c1.json',
        'original'
      );

      const store =
        new ImportActiveConversationStore(
          root
        );

      store.prepareVisibility(sha);
      store.commitPreparedVisibility(sha);

      assert.equal(
        store.all().length,
        1
      );

      writePayload(
        root,
        sha,
        'c1.json',
        'tampered'
      );

      assert.equal(
        store.all().length,
        0
      );

      assert.equal(
        store.verifyVisibility(sha)
          .visible,
        false
      );

      console.log(
        'CIWU_IMPORT_HASH_TAMPER_INVISIBLE_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);

test(
  'extra or missing active import files invalidate visibility',
  () => {
    const root =
      tempRoot();

    try {
      const sha =
        sourceSha('d');

      writePayload(
        root,
        sha,
        'c1.json'
      );

      const store =
        new ImportActiveConversationStore(
          root
        );

      store.prepareVisibility(sha);
      store.commitPreparedVisibility(sha);

      assert.equal(
        store.all().length,
        1
      );

      writePayload(
        root,
        sha,
        'unexpected.json',
        'unexpected'
      );

      assert.equal(
        store.all().length,
        0
      );

      fs.rmSync(
        path.join(
          root,
          sha,
          'unexpected.json'
        )
      );

      assert.equal(
        store.all().length,
        1
      );

      fs.rmSync(
        path.join(
          root,
          sha,
          'c1.json'
        )
      );

      assert.equal(
        store.all().length,
        0
      );

      console.log(
        'CIWU_IMPORT_FILESET_BINDING_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);
