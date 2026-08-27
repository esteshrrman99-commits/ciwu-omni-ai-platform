'use strict';

const { execFileSync } = require('node:child_process');

function git(args) {
  return execFileSync(
    'git',
    args,
    {
      encoding: 'utf8',
      stdio: ['ignore','pipe','pipe']
    }
  ).trim();
}

function inspectRepository() {
  return {
    head: git(['rev-parse','HEAD']),
    branch: git(['branch','--show-current']),
    remote: git(['config','--get','remote.origin.url']),
    status: git(['status','--porcelain']),
    inspectedAt: new Date().toISOString()
  };
}

function mutationPolicy() {
  return {
    branchCreateByAI: false,
    commitByAI: false,
    pushByAI: false,
    pullRequestByAI: false,
    forcePush: false,
    destructiveClean: false
  };
}

module.exports = {
  inspectRepository,
  mutationPolicy
};
