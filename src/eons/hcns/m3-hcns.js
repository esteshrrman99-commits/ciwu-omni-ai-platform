"use strict";

const HCNS_FIELDS = Object.freeze([
  "hope",
  "care",
  "need",
  "shalom"
]);

function normalize(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return value.trim();
  return null;
}

function evaluateHCNS(input = {}) {
  const result = {
    hope: normalize(input.hope),
    care: normalize(input.care),
    need: normalize(input.need),
    shalom: normalize(input.shalom),
    governanceContext: true,
    evidenceOverride: false,
    authorizationOverride: false,
    securityOverride: false,
    warnings: []
  };

  if (result.hope === null) {
    result.warnings.push("HOPE not specified.");
  }

  if (result.care === null) {
    result.warnings.push("CARE not specified.");
  }

  if (result.need === null) {
    result.warnings.push("NEED not specified.");
  }

  if (result.shalom === null) {
    result.warnings.push("SHALOM not specified.");
  }

  result.warnings.push(
    "HCNS is governance context and does not constitute scientific proof."
  );

  result.warnings.push(
    "HCNS cannot override security, authorization, law, or observable reality."
  );

  return result;
}

module.exports = {
  HCNS_FIELDS,
  evaluateHCNS
};
