'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  ProviderContextPersistence,
  sha256
} = require(
  '../../src/native-workspace/provider-context-persistence-v1'
);

const {
  createProviderContextContinuity
} = require(
  '../../src/native-workspace/provider-context-continuity-v1'
);

function fixture() {
  const root =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'ciwu-leap021-'
      )
    );

  return {
    root,
    stateRoot:
      path.join(root, 'state')
  };
}

function valid(overrides = {}) {
  const content =
    overrides.content ||
    'provider context alpha';

  return {
    providerId:'provider-test',
    modelId:'model-test',
    responseId:'response-1',
    contextClass:
      'NON_AUTHORITATIVE_CONTEXT',
    content,
    contentHash:
      sha256(content),
    provenance:{
      source:'provider-response',
      validated:true,
      admitted:true
    },
    authority:{
      operational:false,
      tool:false,
      write:false,
      execute:false,
      commit:false,
      push:false,
      deploy:false,
      network:false
    },
    ...overrides
  };
}

test(
  'LEAP021 persists admitted non-authoritative provider context',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    const row =
      store.persist(valid());

    assert.equal(
      row.body.contextClass,
      'NON_AUTHORITATIVE_CONTEXT'
    );

    assert.equal(
      row.body.authoritativeForIntent,
      false
    );

    assert.equal(
      store.verifyLedger().ok,
      true
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 rejects provider context with authoritative class',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    assert.throws(
      () =>
        store.persist(
          valid({
            contextClass:
              'AUTHORITATIVE_CONTEXT'
          })
        ),
      /UNAUTHORIZED_CONTEXT_CLASS/
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 rejects content hash mismatch',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    assert.throws(
      () =>
        store.persist(
          valid({
            contentHash:
              '0'.repeat(64)
          })
        ),
      /CONTENT_HASH_MISMATCH/
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 rejects inherited operational authority',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    assert.throws(
      () =>
        store.persist(
          valid({
            authority:{
              execute:true
            }
          })
        ),
      /PROVIDER_CONTEXT_AUTHORITY_FORBIDDEN/
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 retrieval survives process-style reconstruction',
  () => {
    const f = fixture();

    const first =
      createProviderContextContinuity({
        stateRoot:f.stateRoot
      });

    first.persistAdmittedContext(
      valid({
        content:'restart-safe'
      })
    );

    const second =
      createProviderContextContinuity({
        stateRoot:f.stateRoot
      });

    const rows =
      second.retrieveAdmittedContext({
        limit:10
      });

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0].body.content,
      'restart-safe'
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 detects ledger tampering',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    store.persist(valid());

    const ledger =
      path.join(
        f.stateRoot,
        'provider-context',
        'provider-context-ledger.jsonl'
      );

    const text =
      fs.readFileSync(
        ledger,
        'utf8'
      );

    fs.writeFileSync(
      ledger,
      text.replace(
        'provider context alpha',
        'tampered provider context'
      )
    );

    const verdict =
      store.verifyLedger();

    assert.equal(
      verdict.ok,
      false
    );

    assert.equal(
      verdict.code,
      'RECORD_HASH_MISMATCH'
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 retrieval remains provider-filtered and bounded',
  () => {
    const f = fixture();

    const store =
      new ProviderContextPersistence({
        stateRoot:f.stateRoot
      });

    store.persist(
      valid({
        responseId:'1',
        content:'A'
      })
    );

    store.persist(
      valid({
        providerId:'provider-other',
        responseId:'2',
        content:'B'
      })
    );

    store.persist(
      valid({
        responseId:'3',
        content:'C'
      })
    );

    const rows =
      store.retrieve({
        providerId:'provider-test',
        limit:1
      });

    assert.equal(
      rows.length,
      1
    );

    assert.equal(
      rows[0].body.content,
      'C'
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);

test(
  'LEAP021 continuity service exposes zero consequential authority',
  () => {
    const f = fixture();

    const continuity =
      createProviderContextContinuity({
        stateRoot:f.stateRoot
      });

    assert.deepEqual(
      continuity.authority,
      {
        operational:false,
        tool:false,
        write:false,
        execute:false,
        commit:false,
        push:false,
        deploy:false,
        network:false
      }
    );

    fs.rmSync(
      f.root,
      {
        recursive:true,
        force:true
      }
    );
  }
);
