'use strict';

const assert =
  require('assert/strict');

const fs =
  require('fs');

const os =
  require('os');

const path =
  require('path');

const {
  ProviderRoutingProvenanceService
} = require(
  '../../src/native-workspace/provider-routing-provenance-v1'
);

const {
  ProviderRoutingLedger
} = require(
  '../../src/native-workspace/provider-routing-ledger-v1'
);

const dir =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-routing-ledger-'
    )
  );

const filePath =
  path.join(
    dir,
    'ledger.json'
  );

const provenanceService =
  new ProviderRoutingProvenanceService({
    env:Object.freeze({})
  });

const inventory =
  provenanceService
    .routingService
    .inventory();

const row =
  inventory.providers[0];

const request = {
  provider:row.provider,
  model:row.models[0],
  required_capabilities:[
    row.capabilities[0]
  ]
};

const p1 =
  provenanceService
    .decide(request)
    .provenance;

const ledger =
  new ProviderRoutingLedger({
    filePath
  });

{
  const initial =
    ledger.verify();

  assert.equal(initial.ok, true);
  assert.equal(initial.entries, 0);

  console.log(
    'T01_EMPTY_LEDGER=PASS'
  );
}

const e1 =
  ledger.append(p1);

assert.equal(e1.ok, true);
assert.equal(e1.sequence, 1);

console.log(
  'T02_FIRST_APPEND=PASS'
);

const p2 =
  provenanceService
    .decide(request)
    .provenance;

const e2 =
  ledger.append(p2);

assert.equal(e2.sequence, 2);
assert.equal(
  e2.previous_entry_sha256,
  e1.entry_sha256
);

console.log(
  'T03_HASH_CHAIN_APPEND=PASS'
);

{
  const verify =
    ledger.verify();

  assert.equal(verify.ok, true);
  assert.equal(verify.entries, 2);

  console.log(
    'T04_LEDGER_VERIFY=PASS'
  );
}

/*
 * Restart continuity:
 * construct a fresh ledger object from the same path.
 */
{
  const restarted =
    new ProviderRoutingLedger({
      filePath
    });

  const verify =
    restarted.verify();

  assert.equal(verify.ok, true);
  assert.equal(verify.entries, 2);

  const e3 =
    restarted.append(
      provenanceService
        .decide(request)
        .provenance
    );

  assert.equal(e3.sequence, 3);

  console.log(
    'T05_RESTART_CONTINUITY=PASS'
  );
}

/*
 * Tamper on disk and require fail closed.
 */
{
  const parsed =
    JSON.parse(
      fs.readFileSync(
        filePath,
        'utf8'
      )
    );

  parsed.entries[0]
    .provenance
    .request
    .model +=
      '-TAMPER';

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      parsed,
      null,
      2
    )
  );

  const corrupted =
    new ProviderRoutingLedger({
      filePath
    });

  assert.throws(
    () =>
      corrupted.read(),
    /ROUTING_LEDGER_PROVENANCE_INVALID/
  );

  console.log(
    'T06_TAMPER_FAIL_CLOSED=PASS'
  );
}

fs.rmSync(
  dir,
  {
    recursive:true,
    force:true
  }
);

console.log(
  'T07_TEMP_STATE_CLEANUP=PASS'
);

console.log(
  'A6_DEDICATED_TEST=PASS'
);
