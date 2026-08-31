'use strict';

const test = require('node:test');
const assert =
  require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  DurableApprovalStore
} = require(
  '../../src/native-workspace/durable-approval-store-v1'
);

test(
  'approved ticket survives process-style store reconstruction',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-approval-durable-'
        )
      );

    try {
      const file =
        path.join(
          root,
          'tickets.json'
        );

      const first =
        new DurableApprovalStore(
          file
        );

      const ticket =
        first.create(
          {
            action:'UPDATE',
            payload:{
              path:'x.txt',
              content:'x'
            }
          },
          '2026-08-30T00:00:00Z'
        );

      first.decide(
        ticket.id,
        'APPROVED',
        '2026-08-30T00:01:00Z'
      );

      const second =
        new DurableApprovalStore(
          file
        );

      const recovered =
        second.get(
          ticket.id
        );

      assert.equal(
        recovered.status,
        'APPROVED'
      );

      assert.equal(
        recovered.action,
        'UPDATE'
      );

      assert.deepEqual(
        recovered.payload,
        {
          path:'x.txt',
          content:'x'
        }
      );

      console.log(
        'CIWU_DURABLE_APPROVAL_RESTART_PASS'
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
