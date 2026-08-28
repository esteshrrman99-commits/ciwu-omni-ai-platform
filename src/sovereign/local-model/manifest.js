'use strict';

function validate(
  manifest
) {
  if (!manifest)
    throw new Error(
      'MANIFEST_REQUIRED'
    );

  if (!manifest.id)
    throw new Error(
      'MODEL_ID_REQUIRED'
    );

  if (!manifest.runtime)
    throw new Error(
      'RUNTIME_REQUIRED'
    );

  if (!manifest.license)
    throw new Error(
      'LICENSE_REQUIRED'
    );

  if (
    manifest.weightsControlled !==
    true &&
    manifest.weightsControlled !==
    false
  ) {
    throw new Error(
      'WEIGHTS_CONTROL_TRUTH_REQUIRED'
    );
  }

  if (
    manifest.networkRequired !==
    true &&
    manifest.networkRequired !==
    false
  ) {
    throw new Error(
      'NETWORK_REQUIREMENT_TRUTH_REQUIRED'
    );
  }

  return true;
}

function capability(
  manifest
) {
  validate(manifest);

  return {
    id:
      manifest.id,

    runtime:
      manifest.runtime,

    license:
      manifest.license,

    local:
      manifest.networkRequired ===
      false,

    weightsControlled:
      manifest.weightsControlled,

    nativeFoundationModel:
      manifest
        .nativeFoundationModel ===
      true
  };
}

module.exports = {
  validate,
  capability
};
