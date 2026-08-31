'use strict';

const test =
  require('node:test');

const assert =
  require('node:assert/strict');

const {
  stableStringify,
  validateProviderResponse
} =
  require(
    '../../src/native-workspace/provider-response-validator-v1'
  );

const {
  ProviderDispatcher
} =
  require(
    '../../src/native-workspace/provider-dispatcher-v1'
  );

const {
  LocalDryRunProviderAdapter
} =
  require(
    '../../src/native-workspace/local-dry-run-provider-adapter-v1'
  );

function requestBinding() {
  return 'a'.repeat(64);
}

/* ==========================================================
 * T01 — VALID RESPONSE
 * ========================================================== */

test(
  'valid provider response is structurally validated and remains non-authoritative',
  () => {
    const result =
      validateProviderResponse({
        provider:
          'CIWU_DRY_RUN',

        response:{
          text:'hello',
          metadata:{
            source:'local-test'
          }
        },

        requestBindingSha256:
          requestBinding(),

        dispatchId:
          'leap019-valid-response-proof'
      });

    assert.equal(
      result.validation.state,
      'VALIDATED'
    );

    assert.equal(
      result.validation
        .structural_validation,
      true
    );

    assert.equal(
      result.validation
        .authority_classification,
      'NON_AUTHORITATIVE'
    );

    assert.equal(
      result.validation
        .content_classification,
      'UNTRUSTED_PROVIDER_CONTENT'
    );

    assert.equal(
      result.validation
        .operational_authority,
      false
    );

    assert.equal(
      result.validation
        .tool_execution_allowed,
      false
    );

    assert.match(
      result.validation
        .provider_response_sha256,
      /^[a-f0-9]{64}$/
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_VALIDATION_PASS'
    );
  }
);

/* ==========================================================
 * T02 — AUTHORITY ESCALATION
 * ========================================================== */

test(
  'provider cannot grant itself operational authority',
  () => {
    assert.throws(
      () =>
        validateProviderResponse({
          provider:
            'CIWU_DRY_RUN',

          response:{
            text:
              'pretend provider output',

            authority:{
              operational_authority:
                true
            }
          },

          requestBindingSha256:
            requestBinding(),

          dispatchId:
            'leap019-authority-proof'
        }),
      error =>
        error &&
        error.code ===
          'PROVIDER_RESPONSE_AUTHORITY_ESCALATION'
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_AUTHORITY_ESCALATION_BLOCKED'
    );
  }
);

/* ==========================================================
 * T03 — SIZE BOUND
 * ========================================================== */

test(
  'oversized provider response fails closed',
  () => {
    assert.throws(
      () =>
        validateProviderResponse({
          provider:
            'CIWU_DRY_RUN',

          response:{
            text:
              'x'.repeat(2048)
          },

          requestBindingSha256:
            requestBinding(),

          dispatchId:
            'leap019-size-proof',

          limits:{
            max_bytes:128
          }
        }),
      error =>
        error &&
        error.code ===
          'PROVIDER_RESPONSE_MAX_BYTES_EXCEEDED'
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_SIZE_GATE_PASS'
    );
  }
);

/* ==========================================================
 * T04 — DEPTH BOUND
 * ========================================================== */

test(
  'excessively deep provider response fails closed',
  () => {
    const response = {
      a:{
        b:{
          c:{
            d:'blocked'
          }
        }
      }
    };

    assert.throws(
      () =>
        validateProviderResponse({
          provider:
            'CIWU_DRY_RUN',

          response,

          requestBindingSha256:
            requestBinding(),

          dispatchId:
            'leap019-depth-proof',

          limits:{
            max_depth:2
          }
        }),
      error =>
        error &&
        error.code ===
          'PROVIDER_RESPONSE_MAX_DEPTH_EXCEEDED'
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_DEPTH_GATE_PASS'
    );
  }
);

/* ==========================================================
 * T05 — DETERMINISTIC HASH / PROVENANCE
 * ========================================================== */

test(
  'canonical response hashing is deterministic across object key order',
  () => {
    const a =
      validateProviderResponse({
        provider:
          'CIWU_DRY_RUN',

        response:{
          alpha:1,
          beta:{
            x:2,
            y:3
          }
        },

        requestBindingSha256:
          requestBinding(),

        dispatchId:
          'leap019-hash-proof'
      });

    const b =
      validateProviderResponse({
        provider:
          'CIWU_DRY_RUN',

        response:{
          beta:{
            y:3,
            x:2
          },
          alpha:1
        },

        requestBindingSha256:
          requestBinding(),

        dispatchId:
          'leap019-hash-proof'
      });

    assert.equal(
      stableStringify({
        b:2,
        a:1
      }),
      stableStringify({
        a:1,
        b:2
      })
    );

    assert.equal(
      a.validation
        .provider_response_sha256,
      b.validation
        .provider_response_sha256
    );

    assert.equal(
      a.validation
        .provenance_sha256,
      b.validation
        .provenance_sha256
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_HASH_BINDING_PASS'
    );
  }
);

/* ==========================================================
 * T06 — REAL LOCAL DISPATCH INTEGRATION
 * ========================================================== */

test(
  'local dry-run dispatch passes validation gate with zero authority and zero network',
  async () => {
    const dispatcher =
      new ProviderDispatcher({
        adapters:[
          new LocalDryRunProviderAdapter()
        ]
      });

    const result =
      await dispatcher.dispatch({
        provider:
          'CIWU_DRY_RUN',

        request:{
          model:
            'ciwu-dry-run-v1',

          instruction:
            'Leap019 integrated validation test'
        },

        budget:{
          timeout_ms:500,
          retry_limit:0
        }
      });

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      result.response_validation
        ?.state,
      'VALIDATED'
    );

    assert.equal(
      result.response_validation
        ?.authority_classification,
      'NON_AUTHORITATIVE'
    );

    assert.equal(
      result.response_validation
        ?.operational_authority,
      false
    );

    assert.equal(
      result.response_validation
        ?.tool_execution_allowed,
      false
    );

    assert.equal(
      result.dispatch_provenance
        ?.response_schema_validated,
      true
    );

    assert.equal(
      result.dispatch_provenance
        ?.response_provenance_bound,
      true
    );

    assert.equal(
      result.dispatch_provenance
        ?.provider_content_authority,
      false
    );

    assert.equal(
      result.dispatch_provenance
        ?.model_network_call,
      false
    );

    assert.equal(
      result.dispatch_provenance
        ?.external_provider_called,
      false
    );

    console.log(
      'CIWU_PROVIDER_RESPONSE_DISPATCH_GATE_PASS'
    );
  }
);
