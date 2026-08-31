'use strict';

const {
  rankRows
} = require(
  './context-ranking-v1'
);

const {
  dedupeContext
} = require(
  './context-dedupe-v1'
);

const {
  applyBudget
} = require(
  './context-budget-v1'
);

const {
  buildPromptEnvelope,
  assertPromptBoundary
} = require(
  './prompt-boundary-v1'
);

class ContextAssemblyService {
  constructor({
    unifiedContextRetrieval
  }) {
    if (
      !unifiedContextRetrieval
    ) {
      throw new Error(
        'CONTEXT_ASSEMBLY_RETRIEVAL_REQUIRED'
      );
    }

    this.retrieval =
      unifiedContextRetrieval;
  }

  assemble({
    current_instruction,
    query,
    limit = 40,
    budget = {}
  }) {
    const retrieval =
      this.retrieval.search(
        query ||
        current_instruction,
        limit
      );

    if (!retrieval.ok) {
      return retrieval;
    }

    const ranked =
      rankRows(
        retrieval.results
      );

    const deduped =
      dedupeContext(
        ranked
      );

    const budgeted =
      applyBudget(
        deduped,
        budget
      );

    const envelope =
      buildPromptEnvelope({
        current_instruction,
        context_rows:
          budgeted.results,
        query:
          retrieval.query,
        budget:{
          ...budgeted.budget,
          used_chars:
            budgeted.used_chars,
          remaining_chars:
            budgeted.remaining_chars
        }
      });

    assertPromptBoundary(
      envelope
    );

    return {
      ok:true,
      retrieval_count:
        retrieval.results.length,
      deduplicated_count:
        deduped.length,
      assembled_count:
        budgeted.results.length,
      used_chars:
        budgeted.used_chars,
      envelope
    };
  }
}

module.exports = {
  ContextAssemblyService
};
