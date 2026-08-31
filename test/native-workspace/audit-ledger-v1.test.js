'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  AuditLedger
} = require('../../src/native-workspace/audit-ledger-v1');

test('audit ledger is append-only hash chained and detects tampering', () => {
  const root = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'ciwu-audit-'
    )
  );

  try {
    const file =
      path.join(
        root,
        'transactions.jsonl'
      );

    const ledger =
      new AuditLedger(file);

    ledger.append({
      timestamp:
        '2026-08-30T23:00:00Z',
      ticket_id: 'ticket-1',
      action: 'UPDATE',
      payload_sha256: 'abc',
      status: 'EXECUTED',
      reason: null,
      result: {
        after_sha256: 'def'
      }
    });

    ledger.append({
      timestamp:
        '2026-08-30T23:01:00Z',
      ticket_id: 'ticket-2',
      action: 'TEST',
      payload_sha256: 'ghi',
      status: 'EXECUTED',
      reason: null,
      result: {
        exit_code: 0
      }
    });

    const verified =
      ledger.verify();

    assert.equal(
      verified.ok,
      true
    );

    assert.equal(
      verified.count,
      2
    );

    const lines =
      fs.readFileSync(
        file,
        'utf8'
      )
      .trimEnd()
      .split('\n');

    const first =
      JSON.parse(lines[0]);

    first.status = 'ALTERED';

    lines[0] =
      JSON.stringify(first);

    fs.writeFileSync(
      file,
      lines.join('\n') + '\n',
      'utf8'
    );

    assert.throws(
      () =>
        new AuditLedger(file)
          .verify(),
      /AUDIT_HASH_INVALID/
    );

    console.log(
      'CIWU_AUDIT_TAMPER_DETECTION_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
