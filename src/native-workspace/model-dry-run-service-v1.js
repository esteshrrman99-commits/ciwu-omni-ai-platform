'use strict';

const {
  selectModel
} = require(
  './model-selection-policy-v1'
);

const {
  redactValue,
  assertNoSecretMaterial
} = require(
  './provider-redaction-v1'
);

const {
  buildProviderRequest
} = require(
  './provider-request-envelope-v1'
);

const {
  buildDryRunResponse
} = require(
  './provider-response-envelope-v1'
);

class ModelDryRunService {
  constructor({
    contextAssemblyService,
    catalog,
    clock =
      () =>
        new Date()
          .toISOString()
  }) {
    if (
      !contextAssemblyService
    ) {
      throw new Error(
        'MODEL_DRY_RUN_CONTEXT_SERVICE_REQUIRED'
      );
    }

    this.contextAssemblyService =
      contextAssemblyService;

    this.catalog = catalog;
    this.clock = clock;
  }

  run({
    current_instruction,
    query,
    requested_provider,
    requested_model,
    metadata = {},
    budget = {}
  }) {
    const assembled =
      this.contextAssemblyService
        .assemble({
          current_instruction,
          query,
          limit:40,
          budget
        });

    if (!assembled.ok) {
      return assembled;
    }

    const route =
      selectModel({
        catalog:
          this.catalog,
        requested_provider,
        requested_model
      });

    const safeMetadata =
      redactValue(
        metadata
      );

    assertNoSecretMaterial(
      safeMetadata
    );

    const request =
      buildProviderRequest({
        route,
        contextEnvelope:
          assembled.envelope,
        metadata:
          safeMetadata,
        clock:
          this.clock
      });

    const response =
      buildDryRunResponse({
        requestEnvelope:
          request,
        clock:
          this.clock
      });

    return {
      ok:true,
      dry_run:true,
      model_network_call:false,
      real_provider_credential_used:false,
      route,
      request,
      response
    };
  }
}

module.exports = {
  ModelDryRunService
};
