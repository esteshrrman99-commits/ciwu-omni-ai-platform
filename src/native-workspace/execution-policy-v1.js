'use strict';

const ALLOWED = Object.freeze({
  'node-check': {
    command: 'node',
    prefix: ['--check']
  },
  'node-test': {
    command: 'node',
    prefix: ['--test']
  },
  'npm-test': {
    command: 'npm',
    prefix: ['test', '--']
  }
});

function resolvePolicy(name) {
  return ALLOWED[name] || null;
}

module.exports = {
  ALLOWED,
  resolvePolicy
};
