'use strict';

const {
  ProviderDispatcher
} = require(
  './provider-dispatcher-v1'
);

function normalizeProviderResponse(
  dispatchResult
) {
  if (
    !dispatchResult ||
    typeof dispatchResult !== 'object'
  ) {
    throw new Error(
      'INVALID_PROVIDER_DISPATCH_RESULT'
    );
  }

  if (dispatchResult.ok !== true) {
    throw new Error(
      dispatchResult.reason ||
      'PROVIDER_DISPATCH_FAILED'
    );
  }

  /*
   * Dispatcher implementations may wrap the
   * provider response. Normalize only known
   * structural locations and fail closed if
   * none expose provider content.
   */
  const response =
    dispatchResult.response ??
    dispatchResult.result ??
    dispatchResult.output ??
    dispatchResult.value ??
    dispatchResult;

  if (
    !response ||
    typeof response !== 'object'
  ) {
    throw new Error(
      'INVALID_PROVIDER_RESPONSE'
    );
  }

  const content =
    typeof response.content === 'string'
      ? response.content
      : (
          typeof response.text === 'string'
            ? response.text
            : null
        );

  if (typeof content !== 'string') {
    throw new Error(
      'INVALID_PROVIDER_RESPONSE'
    );
  }

  return {
    content,

    tool_requests:
      Array.isArray(response.tool_requests)
        ? response.tool_requests
        : []
  };
}

class ChatProviderDispatchBridge {
  constructor({
    provider,
    adapter,
    timeoutMs = 5000,
    retryLimit = 0
  } = {}) {
    if (
      typeof provider !== 'string' ||
      !provider ||
      !adapter ||
      typeof adapter.describe !== 'function' ||
      typeof adapter.invoke !== 'function'
    ) {
      throw new Error(
        'INVALID_CHAT_PROVIDER_BRIDGE'
      );
    }

    const description =
      adapter.describe();

    if (
      !description ||
      description.provider !== provider
    ) {
      throw new Error(
        'CHAT_PROVIDER_IDENTITY_MISMATCH'
      );
    }

    this.provider =
      provider;

    this.timeoutMs =
      timeoutMs;

    this.retryLimit =
      retryLimit;

    this.dispatcher =
      new ProviderDispatcher({
        adapters: [adapter]
      });
  }

  async complete(request) {
    const result =
      await this.dispatcher.dispatch(
        this.provider,
        request,
        {
          timeout_ms:
            this.timeoutMs,

          retry_limit:
            this.retryLimit
        }
      );

    return normalizeProviderResponse(
      result
    );
  }
}

module.exports = {
  ChatProviderDispatchBridge,
  normalizeProviderResponse
};
