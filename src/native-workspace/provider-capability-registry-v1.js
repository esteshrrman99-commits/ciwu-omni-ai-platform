'use strict';

const DEFAULT_PROVIDER_CAPABILITIES =
  Object.freeze([
    Object.freeze({
      provider:'CIWU_DRY_RUN',
      models:[
        'ciwu-dry-run-v1'
      ],
      capabilities:[
        'CHAT',
        'CONTEXT'
      ],
      supports_network:false,
      credential_env_names:[]
    })
  ]);

function cleanName(value) {
  const text =
    String(value || '').trim();

  if (
    !text ||
    text.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(text)
  ) {
    throw new Error(
      'PROVIDER_CAPABILITY_NAME_INVALID'
    );
  }

  return text;
}

function uniqueStrings(values) {
  return [
    ...new Set(
      (Array.isArray(values)
        ? values
        : [])
        .map(cleanName)
    )
  ].sort();
}

class ProviderCapabilityRegistry {
  constructor({
    entries =
      DEFAULT_PROVIDER_CAPABILITIES
  } = {}) {
    if (
      !Array.isArray(entries) ||
      !entries.length
    ) {
      throw new Error(
        'PROVIDER_CAPABILITY_REGISTRY_EMPTY'
      );
    }

    this.entries =
      entries.map(row => ({
        provider:
          cleanName(row.provider),
        models:
          uniqueStrings(row.models),
        capabilities:
          uniqueStrings(
            row.capabilities
          ),
        supports_network:
          row.supports_network === true,
        credential_env_names:
          uniqueStrings(
            row.credential_env_names
          )
      }));

    const names =
      this.entries.map(
        row => row.provider
      );

    if (
      new Set(names).size !==
      names.length
    ) {
      throw new Error(
        'PROVIDER_CAPABILITY_DUPLICATE'
      );
    }

    this.entries.sort(
      (a,b) =>
        a.provider.localeCompare(
          b.provider
        )
    );
  }

  list() {
    return this.entries.map(
      row => ({
        ...row,
        models:[...row.models],
        capabilities:[
          ...row.capabilities
        ],
        credential_env_names:[
          ...row.credential_env_names
        ]
      })
    );
  }

  get(provider) {
    const name =
      cleanName(provider);

    return (
      this.entries.find(
        row =>
          row.provider === name
      ) || null
    );
  }

  require(provider) {
    const row =
      this.get(provider);

    if (!row) {
      throw new Error(
        'PROVIDER_NOT_REGISTERED'
      );
    }

    return row;
  }
}

module.exports = {
  DEFAULT_PROVIDER_CAPABILITIES,
  ProviderCapabilityRegistry
};
