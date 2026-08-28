'use strict';

function normalizeModel(
  provider,
  item
) {
  if (!item)
    return null;

  const id =
    typeof item === 'string'
      ? item
      : (
          item.id ||
          item.name ||
          null
        );

  if (!id)
    return null;

  return {
    provider,
    id:
      String(id),
    discovered:
      true,
    inferenceCertified:
      false,
    costCertified:
      false
  };
}

function normalizeList({
  provider,
  models
}) {
  if (
    !Array.isArray(
      models
    )
  ) {
    throw new Error(
      'MODEL_LIST_REQUIRED'
    );
  }

  const seen =
    new Set();

  const output =
    [];

  for (
    const item of
    models
  ) {
    const model =
      normalizeModel(
        provider,
        item
      );

    if (!model)
      continue;

    const key =
      `${provider}:${model.id}`;

    if (
      seen.has(
        key
      )
    ) continue;

    seen.add(key);
    output.push(model);
  }

  return output;
}

function summarize(
  models
) {
  return {
    discoveredCount:
      models.length,

    inferenceCertifiedCount:
      models.filter(
        x =>
          x.inferenceCertified ===
          true
      ).length,

    costCertifiedCount:
      models.filter(
        x =>
          x.costCertified ===
          true
      ).length
  };
}

module.exports = {
  normalizeModel,
  normalizeList,
  summarize
};
