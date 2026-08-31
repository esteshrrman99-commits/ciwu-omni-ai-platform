'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  rankRows
} = require(
  '../../src/native-workspace/context-ranking-v1'
);

const {
  dedupeContext
} = require(
  '../../src/native-workspace/context-dedupe-v1'
);

const {
  applyBudget
} = require(
  '../../src/native-workspace/context-budget-v1'
);

test(
  'context ranking dedupe and budgets are deterministic and bounded',
  () => {
    const rows = [
      {
        id:'i1',
        source_kind:
          'IMPORTED_HISTORY',
        score:50,
        content:
          'same evidence'
      },
      {
        id:'m1',
        source_kind:
          'PROJECT_MEMORY',
        score:1,
        content:
          'project memory evidence'
      },
      {
        id:'n1',
        source_kind:
          'NATIVE_CONVERSATION',
        score:10,
        content:
          'same evidence'
      },
      {
        id:'n2',
        source_kind:
          'NATIVE_CONVERSATION',
        score:9,
        content:
          'another native evidence record'
      }
    ];

    const ranked =
      rankRows(rows);

    assert.equal(
      ranked[0].source_kind,
      'PROJECT_MEMORY'
    );

    const deduped =
      dedupeContext(
        ranked
      );

    assert.equal(
      deduped.length,
      3
    );

    const budgeted =
      applyBudget(
        deduped,
        {
          max_total_chars:1000,
          max_item_chars:200,
          max_results:2,
          max_per_source:1
        }
      );

    assert.ok(
      budgeted.results.length <= 2
    );

    assert.ok(
      budgeted.used_chars <= 1000
    );

    const counts =
      new Map();

    for (
      const row of
      budgeted.results
    ) {
      counts.set(
        row.source_kind,
        (
          counts.get(
            row.source_kind
          ) || 0
        ) + 1
      );
    }

    for (
      const count of
      counts.values()
    ) {
      assert.ok(count <= 1);
    }

    console.log(
      'CIWU_CONTEXT_RANKING_BUDGET_DEDUPE_PASS'
    );
  }
);
