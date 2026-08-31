'use strict';

const ALLOWED_ROLES = new Set([
  'system',
  'user',
  'assistant',
  'tool'
]);

function validateImport(payload = {}) {
  if (!Array.isArray(payload.messages)) {
    return {
      ok: false,
      reason: 'MESSAGES_REQUIRED'
    };
  }

  for (const message of payload.messages) {
    if (
      !message ||
      !ALLOWED_ROLES.has(message.role) ||
      typeof message.content !== 'string'
    ) {
      return {
        ok: false,
        reason: 'INVALID_MESSAGE'
      };
    }
  }

  return {
    ok: true,
    count: payload.messages.length,
    authority: 'READ_IMPORT_ONLY'
  };
}

module.exports = {
  validateImport
};
