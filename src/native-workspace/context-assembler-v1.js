'use strict';

const {
  retrieve
} = require('./retrieval-v1');

function assemble(memoryState, query, limit = 5) {
  if (
    !memoryState ||
    !Array.isArray(memoryState.records)
  ) {
    return {
      ok: false,
      reason: 'INVALID_MEMORY_STATE',
      context: []
    };
  }

  const matches = retrieve(
    memoryState.records,
    query,
    limit
  );

  return {
    ok: true,
    query,
    context: matches.map(item => ({
      id: item.record.id,
      class: item.record.class,
      content: item.record.content,
      provenance: item.record.provenance,
      confidence: item.record.confidence,
      timestamp: item.record.timestamp,
      lexical_score: item.lexical_score
    }))
  };
}

module.exports = {
  assemble
};
