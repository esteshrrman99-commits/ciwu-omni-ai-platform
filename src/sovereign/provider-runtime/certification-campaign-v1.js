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
  candidates,
  zeroCostOnly = true,
  maximumCampaignCostUsd = 0,
  explicitExecutionRequired = true
}) {
  if (!Array.isArray(candidates)) {
    throw new Error(
      'CANDIDATES_REQUIRED'
    );
  }

  if (zeroCostOnly !== true) {
    throw new Error(
      'ZERO_COST_ONLY_REQUIRED'
    );
  }

  if (
    Number(
      maximumCampaignCostUsd
    ) !== 0
  ) {
    throw new Error(
      'CAMPAIGN_COST_MUST_BE_ZERO'
    );
  }

  const normalized =
    candidates.map(
      (candidate,index) => {
        if (
          !candidate ||
          !candidate.provider ||
          !candidate.model
        ) {
          throw new Error(
            `CANDIDATE_INVALID:${index}`
          );
        }

        return {
          provider:
            String(candidate.provider),

          model:
            String(candidate.model),

          priceEvidenceHash:
            candidate.priceEvidenceHash ||
            null,

          costClass:
            candidate.costClass ||
            'UNKNOWN'
        };
      }
    );

  const base = {
    schema:
      'CIWU_CERTIFICATION_CAMPAIGN_V1',

    campaignId:
      crypto.randomUUID(),

    zeroCostOnly:
      true,

    maximumCampaignCostUsd:
      0,

    explicitExecutionRequired:
      explicitExecutionRequired ===
      true,

    candidates:
      normalized,

    state:
      'PLANNED_NOT_EXECUTED',

    createdAt:
      new Date()
        .toISOString()
  };

  return {
    ...base,
    campaignHash:
      hash(base)
  };
}

function verify(campaign) {
  if (!campaign?.campaignHash)
    return false;

  const copy = {
    ...campaign
  };

  delete copy.campaignHash;

  return (
    hash(copy) ===
    campaign.campaignHash
  );
}

module.exports = {
  hash,
  create,
  verify
};
