'use strict';

const {
  validate
} = require(
  './provider-adapter-contract-v1'
);

function createRegistry() {
  const adapters =
    new Map();

  function register(adapter) {
    const result =
      validate(adapter);

    if (!result.valid) {
      throw new Error(
        result.reason
      );
    }

    if (
      adapters.has(
        adapter.id
      )
    ) {
      throw new Error(
        'ADAPTER_ALREADY_REGISTERED'
      );
    }

    adapters.set(
      adapter.id,
      adapter
    );

    return adapter.id;
  }

  function get(id) {
    return (
      adapters.get(id) ||
      null
    );
  }

  function list() {
    return [...adapters.keys()]
      .sort();
  }

  return {
    register,
    get,
    list
  };
}

module.exports = {
  createRegistry
};
