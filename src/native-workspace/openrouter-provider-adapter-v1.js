'use strict';

const crypto =
  require('node:crypto');

const DEFAULT_ENDPOINT =
  'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL =
  'openrouter/free';

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

function validateKey(value) {
  return (
    typeof value === 'string' &&
    value.length >= 20
  );
}

function normalizeMessages(
  request
) {
  if (
    Array.isArray(request?.messages) &&
    request.messages.length
  ) {
    return request.messages.map(
      message => ({
        role:
          String(
            message?.role ||
            'user'
          ),
        content:
          String(
            message?.content ||
            ''
          )
      })
    );
  }

  if (
    typeof request?.content ===
      'string'
  ) {
    return [
      {
        role:'user',
        content:
          request.content
      }
    ];
  }

  throw Object.assign(
    new Error(
      'OPENROUTER_MESSAGES_REQUIRED'
    ),
    {
      code:
        'OPENROUTER_MESSAGES_REQUIRED',
      retryable:false
    }
  );
}

class OpenRouterProviderAdapter {
  constructor(options = {}) {
    this.provider =
      'OPENROUTER';

    this.endpoint =
      options.endpoint ||
      DEFAULT_ENDPOINT;

    this.model =
      options.model ||
      DEFAULT_MODEL;

    this.apiKey =
      options.apiKey;

    this.fetchImpl =
      options.fetchImpl ||
      globalThis.fetch;

    this.networkEnabled =
      options.networkEnabled === true;

    this.maxOutputTokens =
      Number.isInteger(
        options.maxOutputTokens
      )
        ? options.maxOutputTokens
        : 512;
  }

  describe() {
    return Object.freeze({
      provider:
        this.provider,

      interface:
        'describe+invoke',

      network_capable:
        true,

      external_provider:
        true,

      credential_required:
        true,

      operational_authority:
        false,

      tool_authority:
        false,

      mutation_authority:
        false,

      write_authority:
        false,

      execute_authority:
        false,

      commit_authority:
        false,

      push_authority:
        false,

      deploy_authority:
        false
    });
  }

  async invoke(
    request,
    transport = {}
  ) {
    if (
      this.networkEnabled !== true
    ) {
      const error =
        new Error(
          'OPENROUTER_NETWORK_DISABLED'
        );

      error.code =
        'OPENROUTER_NETWORK_DISABLED';

      error.retryable =
        false;

      throw error;
    }

    if (
      !validateKey(
        this.apiKey
      )
    ) {
      const error =
        new Error(
          'OPENROUTER_CREDENTIAL_UNAVAILABLE'
        );

      error.code =
        'OPENROUTER_CREDENTIAL_UNAVAILABLE';

      error.retryable =
        false;

      throw error;
    }

    if (
      typeof this.fetchImpl !==
        'function'
    ) {
      const error =
        new Error(
          'OPENROUTER_FETCH_UNAVAILABLE'
        );

      error.code =
        'OPENROUTER_FETCH_UNAVAILABLE';

      error.retryable =
        false;

      throw error;
    }

    const signal =
      transport.signal;

    if (signal?.aborted) {
      throw abortError();
    }

    const attemptId =
      String(
        transport.attempt_id ||
        ''
      );

    const idempotencyKey =
      String(
        transport.idempotency_key ||
        ''
      );

    if (!attemptId) {
      const error =
        new Error(
          'PROVIDER_ATTEMPT_ID_REQUIRED'
        );

      error.code =
        'PROVIDER_ATTEMPT_ID_REQUIRED';

      error.retryable =
        false;

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

      error.retryable =
        false;

      throw error;
    }

    const messages =
      normalizeMessages(request);

    const model =
      String(
        request?.model ||
        this.model
      );

    const body = {
      model,
      messages,
      stream:false,
      max_tokens:
        this.maxOutputTokens
    };

    const requestBinding =
      stableSha({
        provider:
          this.provider,
        model,
        messages
      });

    let response;

    try {
      response =
        await this.fetchImpl(
          this.endpoint,
          {
            method:'POST',

            signal,

            headers: {
              'content-type':
                'application/json',

              authorization:
                'Bearer ' +
                this.apiKey
            },

            body:
              JSON.stringify(body)
          }
        );
    } catch (error) {
      if (
        signal?.aborted ||
        error?.name ===
          'AbortError'
      ) {
        throw abortError();
      }

      const wrapped =
        new Error(
          'OPENROUTER_TRANSPORT_FAILURE'
        );

      wrapped.code =
        'OPENROUTER_TRANSPORT_FAILURE';

      wrapped.retryable =
        true;

      throw wrapped;
    }

    if (
      !response ||
      typeof response.ok !==
        'boolean'
    ) {
      const error =
        new Error(
          'OPENROUTER_INVALID_HTTP_RESPONSE'
        );

      error.code =
        'OPENROUTER_INVALID_HTTP_RESPONSE';

      error.retryable =
        false;

      throw error;
    }

    if (!response.ok) {
      const status =
        Number(
          response.status ||
          0
        );

      const error =
        new Error(
          'OPENROUTER_HTTP_' +
          status
        );

      error.code =
        'OPENROUTER_HTTP_' +
        status;

      error.retryable =
        (
          status === 408 ||
          status === 409 ||
          status === 429 ||
          status >= 500
        );

      throw error;
    }

    const payload =
      await response.json();

    const text =
      payload?.choices?.[0]
        ?.message?.content;

    if (
      typeof text !== 'string' ||
      !text
    ) {
      const error =
        new Error(
          'OPENROUTER_RESPONSE_CONTENT_INVALID'
        );

      error.code =
        'OPENROUTER_RESPONSE_CONTENT_INVALID';

      error.retryable =
        false;

      throw error;
    }

    const output = {
      ok:true,

      provider:
        'OPENROUTER',

      model:
        String(
          payload?.model ||
          model
        ),

      text,

      attempt_id:
        attemptId,

      idempotency_key:
        idempotencyKey,

      request_binding_sha256:
        requestBinding,

      external_provider_called:
        true,

      model_network_call:
        true,

      real_provider_credential_used:
        true,

      real_model_response:
        true,

      operational_authority:
        false,

      tool_authority:
        false,

      mutation_authority:
        false,

      write_authority:
        false,

      execute_authority:
        false,

      commit_authority:
        false,

      push_authority:
        false,

      deploy_authority:
        false,

      authority: {
        operational_authority:
          false,

        tool_execution_allowed:
          false,

        mutation_authority:
          false,

        write_authority:
          false,

        execute_authority:
          false,

        commit_authority:
          false,

        push_authority:
          false,

        deploy_authority:
          false
      }
    };

    output.response_sha256 =
      stableSha(output);

    return output;
  }
}

module.exports = {
  OpenRouterProviderAdapter
};
