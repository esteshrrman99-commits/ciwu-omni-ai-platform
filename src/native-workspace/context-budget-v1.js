'use strict';

const DEFAULTS =
  Object.freeze({
    max_total_chars:12000,
    max_item_chars:2200,
    max_results:20,
    max_per_source:8
  });

function boundedInt(
  value,
  fallback,
  min,
  max
) {
  const n =
    Number(value);

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.max(
    min,
    Math.min(
      Math.floor(n),
      max
    )
  );
}

function normalizeBudget(
  input = {}
) {
  return {
    max_total_chars:
      boundedInt(
        input.max_total_chars,
        DEFAULTS.max_total_chars,
        1000,
        50000
      ),
    max_item_chars:
      boundedInt(
        input.max_item_chars,
        DEFAULTS.max_item_chars,
        200,
        8000
      ),
    max_results:
      boundedInt(
        input.max_results,
        DEFAULTS.max_results,
        1,
        50
      ),
    max_per_source:
      boundedInt(
        input.max_per_source,
        DEFAULTS.max_per_source,
        1,
        20
      )
  };
}

function applyBudget(
  rows,
  budgetInput = {}
) {
  const budget =
    normalizeBudget(
      budgetInput
    );

  let used = 0;
  const sourceCounts =
    new Map();

  const accepted = [];

  for (const row of rows) {
    if (
      accepted.length >=
      budget.max_results
    ) {
      break;
    }

    const source =
      String(
        row.source_kind ||
        'UNKNOWN'
      );

    const count =
      sourceCounts.get(
        source
      ) || 0;

    if (
      count >=
      budget.max_per_source
    ) {
      continue;
    }

    const content =
      String(
        row.content || ''
      ).slice(
        0,
        budget.max_item_chars
      );

    if (!content) {
      continue;
    }

    const remaining =
      budget.max_total_chars -
      used;

    if (remaining <= 0) {
      break;
    }

    const finalContent =
      content.slice(
        0,
        remaining
      );

    if (!finalContent) {
      break;
    }

    accepted.push({
      ...row,
      content:
        finalContent,
      budget_truncated:
        finalContent.length <
        String(
          row.content || ''
        ).length
    });

    used +=
      finalContent.length;

    sourceCounts.set(
      source,
      count + 1
    );
  }

  return {
    budget,
    used_chars:used,
    remaining_chars:
      Math.max(
        0,
        budget.max_total_chars -
        used
      ),
    results:accepted
  };
}

module.exports = {
  DEFAULTS,
  normalizeBudget,
  applyBudget
};
