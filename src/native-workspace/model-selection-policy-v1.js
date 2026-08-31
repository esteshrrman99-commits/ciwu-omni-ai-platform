'use strict';

const DEFAULT_CATALOG =
  Object.freeze([
    Object.freeze({
      provider:'CIWU_DRY_RUN',
      model:'ciwu-dry-run-v1',
      priority:1,
      network_allowed:false
    })
  ]);

function cleanName(value) {
  const text =
    String(value || '')
      .trim();

  if (
    !text ||
    text.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(text)
  ) {
    return null;
  }

  return text;
}

function normalizeCatalog(
  catalog = DEFAULT_CATALOG
) {
  if (
    !Array.isArray(catalog) ||
    !catalog.length
  ) {
    throw new Error(
      'MODEL_CATALOG_REQUIRED'
    );
  }

  const rows =
    catalog.map(
      (row,index) => ({
        provider:
          cleanName(
            row.provider
          ),
        model:
          cleanName(
            row.model
          ),
        priority:
          Number.isFinite(
            Number(
              row.priority
            )
          )
            ? Number(
                row.priority
              )
            : index + 1,
        network_allowed:
          row.network_allowed === true
      })
    );

  if (
    rows.some(
      row =>
        !row.provider ||
        !row.model
    )
  ) {
    throw new Error(
      'MODEL_CATALOG_INVALID'
    );
  }

  return rows.sort(
    (a,b) =>
      a.priority -
        b.priority ||
      a.provider.localeCompare(
        b.provider
      ) ||
      a.model.localeCompare(
        b.model
      )
  );
}

function selectModel({
  catalog = DEFAULT_CATALOG,
  requested_provider,
  requested_model
} = {}) {
  const rows =
    normalizeCatalog(
      catalog
    );

  const provider =
    cleanName(
      requested_provider
    );

  const model =
    cleanName(
      requested_model
    );

  let selected = null;

  if (
    provider &&
    model
  ) {
    selected =
      rows.find(
        row =>
          row.provider ===
            provider &&
          row.model ===
            model
      ) || null;
  } else if (provider) {
    selected =
      rows.find(
        row =>
          row.provider ===
            provider
      ) || null;
  } else if (model) {
    selected =
      rows.find(
        row =>
          row.model === model
      ) || null;
  } else {
    selected =
      rows[0] || null;
  }

  if (!selected) {
    throw new Error(
      'MODEL_ROUTE_NOT_FOUND'
    );
  }

  if (
    selected.network_allowed !==
    false
  ) {
    throw new Error(
      'DRY_RUN_NETWORK_ROUTE_BLOCKED'
    );
  }

  return {
    provider:
      selected.provider,
    model:
      selected.model,
    priority:
      selected.priority,
    network_allowed:false,
    routing_mode:
      'DETERMINISTIC_DRY_RUN'
  };
}

module.exports = {
  DEFAULT_CATALOG,
  normalizeCatalog,
  selectModel
};
