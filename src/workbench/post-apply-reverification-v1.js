'use strict';

const validator=
  require('./xeon-sandbox-validator-v1');

function reverify({
  workspace,
  tests=[]
}={}) {
  if (
    !Array.isArray(tests) ||
    tests.length === 0
  ) {
    throw new Error(
      'REVERIFY_TESTS_REQUIRED'
    );
  }

  const result=
    validator.validate({
      workspace,
      checks:
        tests.map(
          file => ({
            file,
            mode:'test'
          })
        )
    });

  return {
    ok:
      result.ok === true,
    schema:
      'CIWU_POST_APPLY_REVERIFICATION_V1',
    testCount:
      result.results.length,
    results:
      result.results,
    productionExecution:false,
    arbitraryShell:false,
    gitAuthority:false,
    deploymentAuthority:false
  };
}

module.exports={
  reverify
};
