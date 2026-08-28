'use strict';

const crypto =
  require('node:crypto');

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function create({
  providerEvidence,
  promptContext,
  modelOutput,
  patchPlan,
  sandboxResult,
  testResult,
  certification
}) {
  if (
    providerEvidence
      ?.realNetworkCall !==
    true
  ) {
    throw new Error(
      'REAL_PROVIDER_EVIDENCE_REQUIRED'
    );
  }

  if (
    certification
      ?.certified !==
    true
  ) {
    throw new Error(
      'SANDBOX_CERTIFICATION_REQUIRED'
    );
  }

  const base = {
    schema:
      'CIWU_REAL_REPAIR_EVIDENCE_V2',

    provider:
      providerEvidence.provider,

    model:
      providerEvidence.model,

    providerEvidenceHash:
      hash(
        providerEvidence
      ),

    promptContextHash:
      hash(
        promptContext
      ),

    modelOutputHash:
      hash(
        modelOutput
      ),

    patchPlanHash:
      hash(
        patchPlan
      ),

    sandboxResultHash:
      hash(
        sandboxResult
      ),

    testResultHash:
      hash(
        testResult
      ),

    certification,

    productionMutation:
      false,

    gitMutation:
      false,

    createdAt:
      new Date()
        .toISOString()
  };

  return {
    ...base,
    evidenceHash:
      hash(base)
  };
}

module.exports = {
  hash,
  create
};
