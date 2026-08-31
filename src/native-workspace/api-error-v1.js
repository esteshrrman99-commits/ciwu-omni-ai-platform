'use strict';

function apiError(status, code, message) {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message
      }
    }
  };
}

function normalizeError(error) {
  const message =
    error && error.message
      ? error.message
      : 'UNKNOWN_ERROR';

  const clientErrors = new Set([
    'INVALID_JSON',
    'INVALID_PATH',
    'PATH_ESCAPE_BLOCKED',
    'NOT_A_FILE',
    'NOT_A_DIRECTORY',
    'FILE_TOO_LARGE',
    'USER_CONTENT_REQUIRED',
    'INVALID_IDENTIFIER',
    'REQUEST_BODY_TOO_LARGE'
  ]);

  return clientErrors.has(message)
    ? apiError(400, message, message)
    : apiError(
        500,
        'INTERNAL_ERROR',
        'Request failed safely'
      );
}

module.exports = {
  apiError,
  normalizeError
};
