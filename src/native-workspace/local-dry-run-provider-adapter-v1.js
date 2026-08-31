'use strict';

const crypto =
  require('node:crypto');

const {
  ProviderAdapter
} =
  require(
    './provider-adapter-interface-v1'
  );

function stableSha(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function abortError() {
  const error =
    new Error(
      'PROVIDER_DISPATCH_ABORTED'
    );

  error.code =
    'PROVIDER_DISPATCH_ABORTED';

  error.retryable =
    false;

  return error;
}

function abortableDelay(
  ms,
  signal
) {
  if (!ms) {
    if (signal?.aborted) {
      return Promise.reject(
        abortError()
      );
    }

    return Promise.resolve();
  }

  return new Promise(
    (resolve,reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }

      let settled = false;

      const cleanup = () => {
        if (signal) {
          signal.removeEventListener(
            'abort',
            onAbort
          );
        }
      };

      const timer =
        setTimeout(
          () => {
            if (settled) {
              return;
            }

            settled = true;
            cleanup();
            resolve();
          },
          ms
        );

      const onAbort = () => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(abortError());
      };

      if (signal) {
        signal.addEventListener(
          'abort',
          onAbort,
          {
            once:true
          }
        );
      }
    }
  );
}

class LocalDryRunProviderAdapter
  extends ProviderAdapter {

  constructor(options = {}) {
    super({
      provider:'CIWU_DRY_RUN',
      networkCapable:false
    });

    this.delayMs =
      Number(options.delayMs) || 0;

    this.failuresBeforeSuccess =
      Number(
        options.failuresBeforeSuccess
      ) || 0;

    this.invocations = 0;

    this.activeInvocations = 0;
    this.maxConcurrentInvocations = 0;

    this.completedInvocations = 0;
    this.abortedInvocations = 0;

    this.seenIdempotencyKeys =
      new Map();
  }

  async invoke(
    request,
    transport = {}
  ) {
    const signal =
      transport.signal;

    const attemptId =
      String(
        transport.attempt_id || ''
      );

    const idempotencyKey =
      String(
        transport.idempotency_key || ''
      );

    if (!attemptId) {
      const error =
        new Error(
          'PROVIDER_ATTEMPT_ID_REQUIRED'
        );

      error.code =
        'PROVIDER_ATTEMPT_ID_REQUIRED';

      throw error;
    }

    if (
      !/^[a-f0-9]{64}$/i.test(
        idempotencyKey
      )
    ) {
      const error =
        new Error(
          'PROVIDER_IDEMPOTENCY_KEY_INVALID'
        );

      error.code =
        'PROVIDER_IDEMPOTENCY_KEY_INVALID';

      throw error;
    }

    if (signal?.aborted) {
      this.abortedInvocations += 1;
      throw abortError();
    }

    this.invocations += 1;
    this.activeInvocations += 1;

    this.maxConcurrentInvocations =
      Math.max(
        this.maxConcurrentInvocations,
        this.activeInvocations
      );

    try {
      await abortableDelay(
        this.delayMs,
        signal
      );

      if (signal?.aborted) {
        this.abortedInvocations += 1;
        throw abortError();
      }

      if (
        this.invocations <=
        this.failuresBeforeSuccess
      ) {
        const error =
          new Error(
            'LOCAL_TRANSIENT_PROVIDER_FAILURE'
          );

        error.code =
          'LOCAL_TRANSIENT_PROVIDER_FAILURE';

        error.retryable =
          true;

        throw error;
      }

      const requestBinding =
        stableSha(request);

      const prior =
        this.seenIdempotencyKeys.get(
          idempotencyKey
        );

      if (
        prior &&
        prior.request_binding_sha256 !==
          requestBinding
      ) {
        const error =
          new Error(
            'PROVIDER_IDEMPOTENCY_CONFLICT'
          );

        error.code =
          'PROVIDER_IDEMPOTENCY_CONFLICT';

        error.retryable =
          false;

        throw error;
      }

      if (prior) {
        return {
          ...prior.response,
          idempotent_replay:true
        };
      }

      const response = {
        ok:true,
        provider:'CIWU_DRY_RUN',
        model:
          request?.model || null,
        text:
          'CIWU local provider simulation; no external provider network call.',
        attempt_id:attemptId,
        idempotency_key:
          idempotencyKey,
        request_binding_sha256:
          requestBinding,
        external_provider_called:false,
        model_network_call:false,
        real_provider_credential_used:false,
        real_model_response:false,
        operational_authority:false,
        tool_authority:false,
        mutation_authority:false,
        write_authority:false,
        execute_authority:false,
        commit_authority:false,
        push_authority:false,
        deploy_authority:false,

        /*
         * Backward-compatible CIWU authority envelope.
         * These are explicit denials only.
         */
        authority:{
          operational_authority:false,
          tool_execution_allowed:false,
          mutation_authority:false,
          write_authority:false,
          execute_authority:false,
          commit_authority:false,
          push_authority:false,
          deploy_authority:false
        }
      };

      response.response_sha256 =
        stableSha(response);

      this.seenIdempotencyKeys.set(
        idempotencyKey,
        {
          request_binding_sha256:
            requestBinding,
          response
        }
      );

      this.completedInvocations += 1;

      return response;
    } catch (error) {
      if (
        error?.code ===
        'PROVIDER_DISPATCH_ABORTED'
      ) {
        this.abortedInvocations += 1;
      }

      throw error;
    } finally {
      this.activeInvocations -= 1;
    }
  }
}

module.exports = {
  LocalDryRunProviderAdapter
};
