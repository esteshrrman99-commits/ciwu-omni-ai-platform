'use strict';

const capabilities = new Map();

function register(capability) {
  if (!capability?.id)
    throw new TypeError('CAPABILITY_ID_REQUIRED');

  capabilities.set(capability.id, {
    id: capability.id,
    type: capability.type || 'UNKNOWN',
    available: capability.available === true,
    verified: capability.verified === true,
    mutation: capability.mutation === true,
    source: capability.source || 'UNSPECIFIED'
  });
}

function get(id) {
  return capabilities.get(id) || null;
}

function list() {
  return [...capabilities.values()];
}

function executable(id) {
  const c = get(id);

  return Boolean(
    c &&
    c.available &&
    c.verified &&
    c.mutation !== true
  );
}

module.exports = {
  register,
  get,
  list,
  executable
};
