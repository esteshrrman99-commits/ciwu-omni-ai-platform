'use strict';

const crypto=require('node:crypto');

const xeon=
  require('./xeon-sandbox-policy-v1');

function canonical(value) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '[' +
      value.map(canonical).join(',') +
      ']';
  }

  const keys=
    Object.keys(value).sort();

  return '{' +
    keys.map(
      key =>
        JSON.stringify(key) +
        ':' +
        canonical(value[key])
    ).join(',') +
    '}';
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value === 'string'
        ? value
        : canonical(value)
    )
    .digest('hex');
}

function create({
  baseSha,
  objective,
  evidenceHash,
  operations=[]
}={}) {
  const base=
    String(baseSha || '')
      .toLowerCase();

  if (
    !/^[0-9a-f]{40}$/.test(base)
  ) {
    throw new Error(
      'PROPOSAL_BASE_SHA_INVALID'
    );
  }

  const goal=
    String(objective || '').trim();

  if (
    !goal ||
    goal.length > 2000
  ) {
    throw new Error(
      'PROPOSAL_OBJECTIVE_INVALID'
    );
  }

  const evidence=
    String(evidenceHash || '')
      .toLowerCase();

  if (
    !/^[0-9a-f]{64}$/.test(
      evidence
    )
  ) {
    throw new Error(
      'PROPOSAL_EVIDENCE_HASH_INVALID'
    );
  }

  if (
    !Array.isArray(operations) ||
    operations.length === 0 ||
    operations.length >
      xeon.MAX_PATCH_OPERATIONS
  ) {
    throw new Error(
      'PROPOSAL_OPERATION_COUNT_INVALID'
    );
  }

  const safeOperations=
    operations.map(
      xeon.assertPatchOperation
    );

  const body={
    schema:
      'CIWU_REPAIR_PROPOSAL_V1',
    baseSha:base,
    objective:goal,
    evidenceHash:evidence,
    operations:safeOperations,
    productionApplyAuthorized:false,
    gitCommitAuthorized:false,
    gitPushAuthorized:false,
    deploymentAuthorized:false,
    purchaseAuthorized:false
  };

  const proposalId=
    sha256(body);

  return Object.freeze({
    ...body,
    proposalId
  });
}

module.exports={
  canonical,
  sha256,
  create
};
