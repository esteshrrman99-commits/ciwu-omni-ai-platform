'use strict';

const {
  bindContextAuthority,
  assertNonAuthoritative
} = require(
  './context-authority-policy-v1'
);

const MAX_QUERY = 500;
const MAX_RESULTS = 50;

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter(Boolean);
}

function score(
  text,
  tokens
) {
  const haystack =
    tokenize(text);

  const counts =
    new Map();

  for (
    const token of
    haystack
  ) {
    counts.set(
      token,
      (counts.get(token) || 0) + 1
    );
  }

  let total = 0;

  for (
    const token of
    tokens
  ) {
    total +=
      counts.get(token) || 0;
  }

  return total;
}

class UnifiedContextRetrieval {
  constructor({
    stateReader,
    importActivationService
  }) {
    if (!stateReader) {
      throw new Error(
        'UNIFIED_CONTEXT_STATE_READER_REQUIRED'
      );
    }

    if (!importActivationService) {
      throw new Error(
        'UNIFIED_CONTEXT_IMPORT_SERVICE_REQUIRED'
      );
    }

    this.stateReader =
      stateReader;

    this.importActivationService =
      importActivationService;
  }

  search(
    query,
    limit = 20
  ) {
    const cleanQuery =
      String(query || '')
        .trim()
        .slice(0, MAX_QUERY);

    if (!cleanQuery) {
      return {
        ok:true,
        query:'',
        results:[],
        authority:
          'CONTEXT_READ_ONLY',
        operational_authority:
          false
      };
    }

    const tokens =
      tokenize(cleanQuery);

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
      const item of
      this.stateReader
        .nativeConversations()
    ) {
      const s =
        score(
          item.content,
          tokens
        );

      if (s <= 0) {
        continue;
      }

      rows.push(
        bindContextAuthority(
          'NATIVE_CONVERSATION',
          {
            score:s,
            id:item.id,
            role:item.role,
            content:
              String(
                item.content
              ).slice(0,2000),
            timestamp:
              item.timestamp,
            provenance:{
              source_file:
                item.source_file,
              source_kind:
                'NATIVE_CONVERSATION'
            }
          }
        )
      );
    }

    for (
      const item of
      this.stateReader
        .projectMemory()
    ) {
      const s =
        score(
          item.content,
          tokens
        );

      if (s <= 0) {
        continue;
      }

      rows.push(
        bindContextAuthority(
          'PROJECT_MEMORY',
          {
            score:s,
            id:item.id,
            class:item.class,
            content:
              String(
                item.content
              ).slice(0,2000),
            confidence:
              item.confidence,
            timestamp:
              item.timestamp,
            provenance:{
              source_file:
                item.source_file,
              memory_provenance:
                item.provenance,
              source_kind:
                'PROJECT_MEMORY'
            }
          }
        )
      );
    }

    const imported =
      this.importActivationService
        .search(
          cleanQuery,
          boundedLimit
        );

    if (
      imported &&
      imported.ok &&
      Array.isArray(
        imported.results
      )
    ) {
      for (
        const item of
        imported.results
      ) {
        rows.push(
          bindContextAuthority(
            'IMPORTED_HISTORY',
            {
              ...item,
              provenance:{
                imported:
                  item.provenance,
                source_sha256:
                  item.source_sha256,
                source_kind:
                  'IMPORTED_HISTORY'
              }
            }
          )
        );
      }
    }

    for (
      const row of
      rows
    ) {
      assertNonAuthoritative(
        row
      );
    }

    rows.sort(
      (a,b) =>
        b.score - a.score ||
        String(
          a.source_kind
        ).localeCompare(
          String(
            b.source_kind
          )
        ) ||
        String(
          a.id || ''
        ).localeCompare(
          String(
            b.id || ''
          )
        )
    );

    return {
      ok:true,
      query:
        cleanQuery,
      authority:
        'CONTEXT_READ_ONLY',
      operational_authority:
        false,
      tool_execution_allowed:
        false,
      mutation_authority:
        false,
      result_count:
        Math.min(
          rows.length,
          boundedLimit
        ),
      results:
        rows.slice(
          0,
          boundedLimit
        )
    };
  }
}

module.exports = {
  UnifiedContextRetrieval
};
