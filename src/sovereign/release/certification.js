'use strict';

function certify(checks) {
  const failed =
    Object.entries(checks)
      .filter(
        ([,value]) =>
          value !== true
      )
      .map(
        ([name]) =>
          name
      );

  return {
    passed:
      failed.length === 0,

    failed,
    checks
  };
}

module.exports = {
  certify
};
