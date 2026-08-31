'use strict';

const DEFAULT_DISPATCH_BUDGET =
  Object.freeze({
    timeout_ms:1500,
    retry_limit:1,
    max_input_chars:24000,
    max_output_chars:12000
  });

function integer(
  value,
  fallback,
  min,
  max
) {
  const n = Number(value);

  if (!Number.isInteger(n)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min,n)
  );
}

function normalizeDispatchBudget(
  input = {}
) {
  return {
    timeout_ms:
      integer(
        input.timeout_ms,
        DEFAULT_DISPATCH_BUDGET
          .timeout_ms,
        50,
        10000
      ),
    retry_limit:
      integer(
        input.retry_limit,
        DEFAULT_DISPATCH_BUDGET
          .retry_limit,
        0,
        2
      ),
    max_input_chars:
      integer(
        input.max_input_chars,
        DEFAULT_DISPATCH_BUDGET
          .max_input_chars,
        256,
        50000
      ),
    max_output_chars:
      integer(
        input.max_output_chars,
        DEFAULT_DISPATCH_BUDGET
          .max_output_chars,
        256,
        24000
      )
  };
}

function assertInputBudget(
  request,
  budget
) {
  const chars =
    JSON.stringify(request)
      .length;

  if (
    chars >
    budget.max_input_chars
  ) {
    throw new Error(
      'PROVIDER_INPUT_BUDGET_EXCEEDED'
    );
  }

  return chars;
}

function assertOutputBudget(
  response,
  budget
) {
  const chars =
    JSON.stringify(response)
      .length;

  if (
    chars >
    budget.max_output_chars
  ) {
    throw new Error(
      'PROVIDER_OUTPUT_BUDGET_EXCEEDED'
    );
  }

  return chars;
}

module.exports = {
  DEFAULT_DISPATCH_BUDGET,
  normalizeDispatchBudget,
  assertInputBudget,
  assertOutputBudget
};
