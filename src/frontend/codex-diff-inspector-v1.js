'use strict';

const crypto=require('node:crypto');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

function inspect({
  baseCommit,
  file,
  diff,
  sandboxPassed=false,
  regressionPassed=false,
  humanApproved=false
}) {
  if (!baseCommit)
    throw new Error('BASE_COMMIT_REQUIRED');

  if (!file)
    throw new Error('FILE_REQUIRED');

  if (typeof diff !== 'string')
    throw new Error('DIFF_REQUIRED');

  return {
    baseCommit,
    file,
    diffHash:sha256(diff),
    addedLines:
      diff.split('\n')
        .filter(line =>
          line.startsWith('+') &&
          !line.startsWith('+++')
        ).length,
    removedLines:
      diff.split('\n')
        .filter(line =>
          line.startsWith('-') &&
          !line.startsWith('---')
        ).length,
    sandboxPassed:
      sandboxPassed === true,
    regressionPassed:
      regressionPassed === true,
    humanApproved:
      humanApproved === true,
    productionMutation:false,
    gitPush:false
  };
}

module.exports={
  sha256,
  inspect
};
