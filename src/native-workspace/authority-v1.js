'use strict';

const LEVELS = Object.freeze({
  READ: 'READ',
  WRITE: 'WRITE',
  EXECUTE: 'EXECUTE',
  COMMIT: 'COMMIT',
  PUSH: 'PUSH',
  DEPLOY: 'DEPLOY'
});

const MUTATING = new Set([
  LEVELS.WRITE,
  LEVELS.EXECUTE,
  LEVELS.COMMIT,
  LEVELS.PUSH,
  LEVELS.DEPLOY
]);

function authorize(level, grants = []) {
  if (!Object.values(LEVELS).includes(level)) {
    return {
      ok: false,
      level,
      reason: 'UNKNOWN_AUTHORITY'
    };
  }

  if (level === LEVELS.READ) {
    return {
      ok: true,
      level,
      reason: 'READ_ALLOWED'
    };
  }

  if (MUTATING.has(level) && !grants.includes(level)) {
    return {
      ok: false,
      level,
      reason: 'EXPLICIT_AUTHORIZATION_REQUIRED'
    };
  }

  return {
    ok: true,
    level,
    reason: 'EXPLICIT_AUTHORIZATION_PRESENT'
  };
}

module.exports = {
  LEVELS,
  MUTATING,
  authorize
};
