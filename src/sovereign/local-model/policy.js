'use strict';

function canRun({
  manifest,
  executionEnvironment,
  memoryRequirementMb,
  availableMemoryMb
}) {
  if (
    executionEnvironment !==
    'ISOLATED'
  ) {
    return {
      allowed: false,
      reason:
        'ISOLATED_ENVIRONMENT_REQUIRED'
    };
  }

  if (
    Number(
      memoryRequirementMb
    ) >
    Number(
      availableMemoryMb
    )
  ) {
    return {
      allowed: false,
      reason:
        'INSUFFICIENT_MEMORY'
    };
  }

  if (!manifest.license) {
    return {
      allowed: false,
      reason:
        'LICENSE_UNKNOWN'
    };
  }

  return {
    allowed: true,
    reason:
      'LOCAL_MODEL_EXECUTION_ALLOWED'
  };
}

module.exports = {
  canRun
};
