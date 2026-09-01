'use strict';

const fs = require('fs');
const path = require('path');

const {
  sha256,
  verifyProvenance
} = require(
  './provider-routing-provenance-v1'
);

const VERSION =
  'CIWU_PROVIDER_ROUTING_LEDGER_V1';

function atomicWrite(
  filePath,
  content
) {
  const dir =
    path.dirname(filePath);

  fs.mkdirSync(
    dir,
    {
      recursive:true,
      mode:0o700
    }
  );

  const tmp =
    filePath +
    '.tmp-' +
    process.pid +
    '-' +
    Date.now();

  fs.writeFileSync(
    tmp,
    content,
    {
      encoding:'utf8',
      mode:0o600
    }
  );

  fs.renameSync(
    tmp,
    filePath
  );
}

function loadLedger(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      version:VERSION,
      entries:[]
    };
  }

  let parsed;

  try {
    parsed =
      JSON.parse(
        fs.readFileSync(
          filePath,
          'utf8'
        )
      );
  } catch {
    throw new Error(
      'ROUTING_LEDGER_CORRUPT'
    );
  }

  if (
    !parsed ||
    parsed.version !== VERSION ||
    !Array.isArray(parsed.entries)
  ) {
    throw new Error(
      'ROUTING_LEDGER_SCHEMA_INVALID'
    );
  }

  return parsed;
}

function verifyLedger(
  ledger
) {
  if (
    !ledger ||
    ledger.version !== VERSION ||
    !Array.isArray(ledger.entries)
  ) {
    return {
      ok:false,
      reason:'ROUTING_LEDGER_SCHEMA_INVALID'
    };
  }

  let prior =
    null;

  for (
    let i = 0;
    i < ledger.entries.length;
    i += 1
  ) {
    const entry =
      ledger.entries[i];

    if (
      !entry ||
      typeof entry !== 'object'
    ) {
      return {
        ok:false,
        reason:'ROUTING_LEDGER_ENTRY_INVALID',
        index:i
      };
    }

    const provenanceCheck =
      verifyProvenance(
        entry.provenance
      );

    if (!provenanceCheck.ok) {
      return {
        ok:false,
        reason:
          'ROUTING_LEDGER_PROVENANCE_INVALID',
        index:i
      };
    }

    if (
      entry.previous_entry_sha256 !==
      prior
    ) {
      return {
        ok:false,
        reason:
          'ROUTING_LEDGER_CHAIN_BROKEN',
        index:i
      };
    }

    const base = {
      sequence:
        entry.sequence,

      previous_entry_sha256:
        entry.previous_entry_sha256,

      provenance:
        entry.provenance
    };

    const expected =
      sha256(base);

    if (
      expected !==
      entry.entry_sha256
    ) {
      return {
        ok:false,
        reason:
          'ROUTING_LEDGER_ENTRY_HASH_MISMATCH',
        index:i
      };
    }

    prior =
      entry.entry_sha256;
  }

  return {
    ok:true,
    entries:
      ledger.entries.length,
    tip_sha256:
      prior
  };
}

class ProviderRoutingLedger {

  constructor({
    filePath
  } = {}) {
    if (
      typeof filePath !== 'string' ||
      !filePath
    ) {
      throw new Error(
        'ROUTING_LEDGER_PATH_REQUIRED'
      );
    }

    this.filePath =
      filePath;
  }

  read() {
    const ledger =
      loadLedger(
        this.filePath
      );

    const verification =
      verifyLedger(
        ledger
      );

    if (!verification.ok) {
      throw new Error(
        verification.reason
      );
    }

    return ledger;
  }

  append(provenance) {
    const provenanceCheck =
      verifyProvenance(
        provenance
      );

    if (!provenanceCheck.ok) {
      throw new Error(
        'ROUTING_PROVENANCE_REJECTED'
      );
    }

    const ledger =
      this.read();

    const prior =
      ledger.entries.length
        ? ledger.entries[
            ledger.entries.length - 1
          ].entry_sha256
        : null;

    const base = {
      sequence:
        ledger.entries.length + 1,

      previous_entry_sha256:
        prior,

      provenance
    };

    const entry = {
      ...base,
      entry_sha256:
        sha256(base)
    };

    const next = {
      version:VERSION,
      entries:[
        ...ledger.entries,
        entry
      ]
    };

    const verification =
      verifyLedger(next);

    if (!verification.ok) {
      throw new Error(
        verification.reason
      );
    }

    atomicWrite(
      this.filePath,
      JSON.stringify(
        next,
        null,
        2
      ) + '\n'
    );

    return {
      ok:true,
      sequence:
        entry.sequence,
      entry_sha256:
        entry.entry_sha256,
      previous_entry_sha256:
        entry.previous_entry_sha256
    };
  }

  verify() {
    return verifyLedger(
      loadLedger(
        this.filePath
      )
    );
  }
}

module.exports = {
  VERSION,
  atomicWrite,
  loadLedger,
  verifyLedger,
  ProviderRoutingLedger
};
