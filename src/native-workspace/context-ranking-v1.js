'use strict';

const SOURCE_WEIGHT =
  Object.freeze({
    PROJECT_MEMORY:300,
    NATIVE_CONVERSATION:200,
    IMPORTED_HISTORY:100
  });

function numericScore(
  value
) {
  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}

function sourceWeight(
  sourceKind
) {
  return (
    SOURCE_WEIGHT[
      sourceKind
    ] || 0
  );
}

function rankRows(rows) {
  return [...rows]
    .map(
      (row,index) => ({
        ...row,
        _rank_index:index,
        _rank_value:
          sourceWeight(
            row.source_kind
          ) +
          numericScore(
            row.score
          )
      })
    )
    .sort(
      (a,b) =>
        b._rank_value -
          a._rank_value ||
        String(
          a.source_kind || ''
        ).localeCompare(
          String(
            b.source_kind || ''
          )
        ) ||
        String(
          a.id || ''
        ).localeCompare(
          String(
            b.id || ''
          )
        ) ||
        a._rank_index -
          b._rank_index
    )
    .map(
      ({
        _rank_index,
        _rank_value,
        ...row
      }) => ({
        ...row,
        rank_score:
          _rank_value
      })
    );
}

module.exports = {
  SOURCE_WEIGHT,
  sourceWeight,
  rankRows
};
