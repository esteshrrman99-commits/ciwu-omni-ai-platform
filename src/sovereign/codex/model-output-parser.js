'use strict';

const {
  validatePlan
} = require(
  './patch-contract-v2'
);

function parse(
  text
) {
  if (
    typeof text !==
      'string' ||
    !text.trim()
  ) {
    throw new Error(
      'MODEL_OUTPUT_REQUIRED'
    );
  }

  let value;

  try {
    value =
      JSON.parse(
        text
      );
  } catch {
    throw new Error(
      'MODEL_OUTPUT_NOT_JSON'
    );
  }

  validatePlan(
    value
  );

  return value;
}

module.exports = {
  parse
};
