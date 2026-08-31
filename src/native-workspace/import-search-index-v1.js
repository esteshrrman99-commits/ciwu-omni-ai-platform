'use strict';

const MAX_QUERY = 500;
const MAX_RESULTS = 50;

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter(Boolean);
}

function scoreText(
  text,
  queryTokens
) {
  const tokens =
    tokenize(text);

  if (!tokens.length) {
    return 0;
  }

  const counts =
    new Map();

  for (const token of tokens) {
    counts.set(
      token,
      (counts.get(token) || 0) + 1
    );
  }

  let score = 0;

  for (
    const token of
    queryTokens
  ) {
    score +=
      counts.get(token) || 0;
  }

  return score;
}

class ImportSearchIndex {
  constructor(store) {
    if (!store) {
      throw new Error(
        'IMPORT_SEARCH_STORE_REQUIRED'
      );
    }

    this.store = store;
  }

  search(
    query,
    limit = 20
  ) {
    const text =
      String(query || '')
        .trim()
        .slice(0, MAX_QUERY);

    if (!text) {
      return [];
    }

    const tokens =
      tokenize(text);

    const boundedLimit =
      Math.max(
        1,
        Math.min(
          Number(limit) || 20,
          MAX_RESULTS
        )
      );

    const rows = [];

    for (
      const conversation of
      this.store.all()
    ) {
      for (
        let i = 0;
        i <
        conversation.messages.length;
        i++
      ) {
        const message =
          conversation.messages[i];

        const score =
          scoreText(
            message.content,
            tokens
          );

        if (score <= 0) {
          continue;
        }

        rows.push({
          score,
          source_sha256:
            conversation.source_sha256,
          conversation_id:
            conversation.external_id,
          title:
            conversation.title,
          message_id:
            message.id,
          ordinal:i,
          role:
            message.role,
          content:
            String(
              message.content || ''
            ).slice(0, 2000),
          provenance:
            message.provenance,
          import_authority:
            'READ_IMPORT_ONLY',
          imported_content_inert:
            true,
          tool_execution_allowed:
            false,
          mutation_authority:
            false
        });
      }
    }

    rows.sort(
      (a,b) =>
        b.score - a.score ||
        String(a.conversation_id)
          .localeCompare(
            String(b.conversation_id)
          ) ||
        a.ordinal - b.ordinal
    );

    return rows.slice(
      0,
      boundedLimit
    );
  }
}

module.exports = {
  ImportSearchIndex
};
