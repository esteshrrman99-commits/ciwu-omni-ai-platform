'use strict';

const crypto=require('node:crypto');

function create({
  baseCommit,
  patchHash,
  sandboxOnly=true,
  allowedCommands=[],
  humanApproval=false
}) {
  if (!baseCommit)
    throw new Error('BASE_COMMIT_REQUIRED');

  if (!patchHash)
    throw new Error('PATCH_HASH_REQUIRED');

  if (sandboxOnly !== true)
    throw new Error(
      'PRODUCTION_EXECUTION_FORBIDDEN'
    );

  return {
    schema:'CIWU_CODEX_EXECUTION_INTENT_V5',

    intentId:
      crypto.randomUUID(),

    baseCommit,
    patchHash,

    sandboxOnly:true,

    allowedCommands:
      [...allowedCommands],

    humanApproval:
      humanApproval === true,

    productionMutation:false,
    gitPush:false,
    purchaseAuthority:false,

    createdAt:
      new Date().toISOString()
  };
}

module.exports={ create };
