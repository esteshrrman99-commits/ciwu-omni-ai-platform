'use strict';

function evaluate({
  patchHash,
  syntaxPassed,
  unitTestsPassed,
  regressionsPassed,
  sandboxCertified,
  providerEvidenceValid,
  humanApproval = false
}) {
  const failures = [];

  if (!patchHash)
    failures.push(
      'PATCH_HASH_REQUIRED'
    );

  if (syntaxPassed !== true)
    failures.push(
      'SYNTAX_REQUIRED'
    );

  if (unitTestsPassed !== true)
    failures.push(
      'UNIT_TESTS_REQUIRED'
    );

  if (regressionsPassed !== true)
    failures.push(
      'REGRESSION_REQUIRED'
    );

  if (sandboxCertified !== true)
    failures.push(
      'SANDBOX_CERTIFICATION_REQUIRED'
    );

  if (
    providerEvidenceValid !==
    true
  )
    failures.push(
      'PROVIDER_EVIDENCE_REQUIRED'
    );

  const technicallyCertified =
    failures.length === 0;

  return {
    technicallyCertified,

    productionPromotionAuthorized:
      technicallyCertified &&
      humanApproval === true,

    humanApprovalRequired:
      true,

    failures
  };
}

module.exports = {
  evaluate
};
