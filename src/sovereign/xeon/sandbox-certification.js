'use strict';

function certify({
  workspaceIsTemporary,
  productionPathTouched,
  syntaxPassed,
  testsPassed,
  patchValidated,
  cleanupConfirmed
}) {
  const gates = {
    workspaceIsTemporary:
      workspaceIsTemporary ===
      true,

    productionPathUntouched:
      productionPathTouched !==
      true,

    syntaxPassed:
      syntaxPassed ===
      true,

    testsPassed:
      testsPassed ===
      true,

    patchValidated:
      patchValidated ===
      true,

    cleanupConfirmed:
      cleanupConfirmed ===
      true
  };

  const pass =
    Object
      .values(gates)
      .every(Boolean);

  return {
    certified:
      pass,

    gates,

    promotionAllowed:
      pass
  };
}

module.exports = {
  certify
};
