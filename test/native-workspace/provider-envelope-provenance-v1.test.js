'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');

const {
  buildProviderRequest
} = require(
  '../../src/native-workspace/provider-request-envelope-v1'
);

const {
  buildDryRunResponse
} = require(
  '../../src/native-workspace/provider-response-envelope-v1'
);

test(
  'provider request and simulated response are cryptographically bound and authority inert',
  () => {
    const contextEnvelope = {
      current:{
        class:
          'CURRENT_USER_INSTRUCTION',
        content:'Explain only.'
      },
      historical_context:{
        class:
          'NON_AUTHORITATIVE_CONTEXT',
        items:[]
      },
      model_authority:{
        tool_execution_allowed:false,
        mutation_authority:false,
        write_authority:false,
        execute_authority:false,
        commit_authority:false,
        push_authority:false,
        deploy_authority:false
      }
    };

    const request =
      buildProviderRequest({
        route:{
          provider:'CIWU_DRY_RUN',
          model:'ciwu-dry-run-v1',
          routing_mode:
            'DETERMINISTIC_DRY_RUN',
          network_allowed:false
        },
        contextEnvelope,
        metadata:{
          purpose:'test'
        },
        clock:
          () =>
            '2026-01-01T00:00:00.000Z'
      });

    assert.match(
      request.request_sha256,
      /^[a-f0-9]{64}$/
    );

    assert.equal(
      request.network_allowed,
      false
    );

    const response =
      buildDryRunResponse({
        requestEnvelope:
          request,
        clock:
          () =>
            '2026-01-01T00:00:01.000Z'
      });

    assert.equal(
      response.request_sha256,
      request.request_sha256
    );

    assert.match(
      response.response_sha256,
      /^[a-f0-9]{64}$/
    );

    assert.equal(
      response.provenance
        .external_provider_called,
      false
    );

    assert.equal(
      response.authority
        .write_authority,
      false
    );

    assert.equal(
      response.authority
        .execute_authority,
      false
    );

    assert.equal(
      response.authority
        .push_authority,
      false
    );

    console.log(
      'CIWU_PROVIDER_ENVELOPE_PROVENANCE_PASS'
    );
  }
);
