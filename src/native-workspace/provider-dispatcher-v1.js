'use strict';

const {
  validateProviderResponse
} =
  require(
    './provider-response-validator-v1'
  );

const crypto =
  require('node:crypto');

const {
  assertAdapter
} =
  require(
    './provider-adapter-interface-v1'
  );

const {
  normalizeDispatchBudget,
  assertInputBudget,
  assertOutputBudget
} =
  require(
    './provider-dispatch-budget-v1'
  );

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function errorWith(
  code,
  retryable = false
) {
  const error =
    new Error(code);

  error.code = code;
  error.retryable =
    retryable;

  return error;
}

function attemptId(
  dispatchId,
  attempt
) {
  return sha({
    dispatch_id:dispatchId,
    attempt
  }).slice(0, 32);
}

function retryable(error) {
  return Boolean(
    error &&
    error.retryable === true &&
    error.code !==
      'PROVIDER_DISPATCH_ABORTED' &&
    error.code !==
      'PROVIDER_DISPATCH_TIMEOUT' &&
    error.code !==
      'PROVIDER_IDEMPOTENCY_CONFLICT'
  );
}

class ProviderDispatcher {
  constructor(options = {}) {
    this.adapters =
      new Map();

    this.inflight =
      new Map();

    /*
     * Backward-compatible constructor boundary.
     *
     * Supported inherited forms:
     *   new ProviderDispatcher(adapter)
     *   new ProviderDispatcher({adapter})
     *   new ProviderDispatcher({adapters:[...]})
     *
     * This changes registration compatibility only.
     * Network-capable adapters remain blocked inside
     * dispatch() before invocation.
     */
    const initialAdapters = [];

    if (
      options &&
      typeof options.describe === 'function' &&
      typeof options.invoke === 'function'
    ) {
      initialAdapters.push(options);
    } else {
      if (
        options &&
        options.adapter
      ) {
        initialAdapters.push(
          options.adapter
        );
      }

      if (
        options &&
        Array.isArray(
          options.adapters
        )
      ) {
        initialAdapters.push(
          ...options.adapters
        );
      }
    }

    for (
      const adapter of
      initialAdapters
    ) {
      this.register(adapter);
    }
  }

  register(adapter) {
    assertAdapter(adapter);

    const description =
      adapter.describe();

    this.adapters.set(
      description.provider,
      adapter
    );

    return description;
  }

  async _invokeAttempt({
    adapter,
    request,
    timeoutMs,
    dispatchId,
    idempotencyKey,
    attempt
  }) {
    const controller =
      new AbortController();

    const aid =
      attemptId(
        dispatchId,
        attempt
      );

    let timeoutHandle = null;
    let timeoutWon = false;

    const invocation =
      Promise.resolve()
        .then(
          () =>
            adapter.invoke(
              request,
              {
                signal:
                  controller.signal,
                dispatch_id:
                  dispatchId,
                attempt_id:
                  aid,
                attempt,
                idempotency_key:
                  idempotencyKey
              }
            )
        );

    /*
     * Attach rejection handling immediately so a
     * late adapter rejection can never become an
     * unhandled rejection after timeout.
     */
    const observedInvocation =
      invocation.then(
        value => ({
          kind:'RESULT',
          value
        }),
        error => ({
          kind:'ERROR',
          error
        })
      );

    const timeout =
      new Promise(resolve => {
        timeoutHandle =
          setTimeout(
            () => {
              timeoutWon = true;
              controller.abort();

              resolve({
                kind:'TIMEOUT'
              });
            },
            timeoutMs
          );
      });

    if (
      timeoutHandle &&
      typeof timeoutHandle.unref ===
        'function'
    ) {
      timeoutHandle.unref();
    }

    const winner =
      await Promise.race([
        observedInvocation,
        timeout
      ]);

    if (
      timeoutHandle !== null
    ) {
      clearTimeout(
        timeoutHandle
      );
    }

    if (
      winner.kind ===
      'TIMEOUT'
    ) {
      /*
       * Critical safety rule:
       * do not return/retry until the aborted
       * invocation has actually settled.
       */
      await observedInvocation;

      throw errorWith(
        'PROVIDER_DISPATCH_TIMEOUT',
        false
      );
    }

    if (
      timeoutWon ||
      controller.signal.aborted
    ) {
      throw errorWith(
        'PROVIDER_LATE_RESULT_REJECTED',
        false
      );
    }

    if (
      winner.kind ===
      'ERROR'
    ) {
      throw winner.error;
    }

    return {
      value:winner.value,
      attempt_id:aid
    };
  }

  async dispatch(
    providerOrOptions,
    requestArg,
    budgetArg = {}
  ) {
    /*
     * Preserve the inherited Leap016 API:
     *
     *   dispatch({
     *     provider,
     *     request,
     *     budget
     *   })
     *
     * while also supporting the Leap018 positional form:
     *
     *   dispatch(
     *     provider,
     *     request,
     *     budget
     *   )
     *
     * Normalization happens before any provider lookup,
     * adapter invocation, retry, or network authority.
     */
    let provider;
    let request;
    let budgetOptions;

    if (
      providerOrOptions &&
      typeof providerOrOptions === 'object' &&
      !Array.isArray(providerOrOptions)
    ) {
      provider =
        providerOrOptions.provider;

      request =
        providerOrOptions.request;

      budgetOptions =
        providerOrOptions.budget || {};
    } else {
      provider =
        providerOrOptions;

      request =
        requestArg;

      budgetOptions =
        budgetArg || {};
    }

    if (
      !provider ||
      typeof provider !== 'string'
    ) {
      throw errorWith(
        'PROVIDER_NAME_REQUIRED'
      );
    }

    const adapter =
      this.adapters.get(provider);

    if (!adapter) {
      throw errorWith(
        'PROVIDER_ADAPTER_NOT_FOUND'
      );
    }

    /*
     * assertAdapter() validates and returns boolean true
     * in the inherited Leap016 interface.  The actual
     * capability description must be read separately.
     */
    assertAdapter(adapter);

    const description =
      adapter.describe();

    /*
     * Leap018 remains zero-network.
     * Reject before adapter invocation.
     */
    if (
      description.network_capable ===
      true
    ) {
      throw errorWith(
        'NETWORK_CAPABLE_ADAPTER_BLOCKED'
      );
    }

    const budget =
      normalizeDispatchBudget(
        budgetOptions
      );

    assertInputBudget(
      request,
      budget
    );

    const requestBinding =
      sha(request);

    const dispatchId =
      sha({
        provider,
        request_binding_sha256:
          requestBinding
      });

    const idempotencyKey =
      sha({
        authority:
          'CIWU_PROVIDER_DISPATCH_V1',
        provider,
        request_binding_sha256:
          requestBinding
      });

    /*
     * Same logical operation may not execute
     * concurrently in this dispatcher.
     */
    if (
      this.inflight.has(
        idempotencyKey
      )
    ) {
      return this.inflight.get(
        idempotencyKey
      );
    }

    const operation =
      (async () => {
        let attempts = 0;
        let lastError = null;

        const maximumAttempts =
          1 + budget.retry_limit;

        while (
          attempts <
          maximumAttempts
        ) {
          attempts += 1;

          try {
            const result =
              await this._invokeAttempt({
                adapter,
                request,
                timeoutMs:
                  budget.timeout_ms,
                dispatchId,
                idempotencyKey,
                attempt:attempts
              });

            assertOutputBudget(
              result.value,
              budget
            );

            /*
             * Leap019 trust boundary:
             * successful transport does not imply
             * trusted or authoritative content.
             */
            const validated =
              validateProviderResponse({
                provider,
                response:
                  result.value,
                requestBindingSha256:
                  requestBinding,
                dispatchId,
                attemptId:
                  result.attempt_id,
                idempotencyKey
              });

            return {
              ok:true,
              provider,
              attempts,
              dispatch_id:
                dispatchId,
              attempt_id:
                result.attempt_id,
              idempotency_key:
                idempotencyKey,
              request_binding_sha256:
                requestBinding,
              response:
                validated.response,
              response_validation:
                validated.validation,
              dispatch_provenance:{
                transport_abort_supported:
                  true,
                retry_requires_prior_settlement:
                  true,
                idempotency_bound:
                  true,
                concurrent_duplicate_coalesced:
                  true,
                late_result_authority:
                  false,
                network_adapter_execution:
                  false,
                external_provider_called:
                  false,
                model_network_call:
                  false,
                real_provider_credential_used:
                  false,
                response_schema_validated:
                  true,
                response_provenance_bound:
                  true,
                provider_content_authority:
                  false
              }
            };
          } catch (error) {
            lastError = error;

            if (
              !retryable(error) ||
              attempts >=
                maximumAttempts
            ) {
              break;
            }
          }
        }

        const reason =
          lastError?.code ||
          'PROVIDER_DISPATCH_FAILED';

        /*
         * Preserve inherited CIWU fail-closed dispatch
         * semantics for ordinary provider execution
         * failure/timeout.  Policy violations such as
         * NETWORK_CAPABLE_ADAPTER_BLOCKED still reject
         * before an invocation begins.
         */
        return {
          ok:false,
          provider,
          reason,
          attempts,
          dispatch_id:
            dispatchId,
          idempotency_key:
            idempotencyKey,
          request_binding_sha256:
            requestBinding,
          response:null,
          dispatch_provenance:{
            transport_abort_supported:true,
            retry_requires_prior_settlement:true,
            idempotency_bound:true,
            concurrent_duplicate_coalesced:true,
            late_result_authority:false,
            network_adapter_execution:false,
            external_provider_called:false,
            model_network_call:false,
            real_provider_credential_used:false
          }
        };
      })();

    this.inflight.set(
      idempotencyKey,
      operation
    );

    try {
      return await operation;
    } finally {
      if (
        this.inflight.get(
          idempotencyKey
        ) === operation
      ) {
        this.inflight.delete(
          idempotencyKey
        );
      }
    }
  }
}

module.exports = {
  ProviderDispatcher
};
