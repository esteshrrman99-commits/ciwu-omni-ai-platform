'use strict';

const {
  CircuitBreaker
} = require(
  '../provider-control/circuit-breaker'
);

const {
  order
} = require(
  '../provider-control/fallback'
);

const {
  get
} = require(
  '../provider-runtime/adapter-registry'
);

const {
  authorizeSpend
} = require(
  '../eons/budget'
);

const health =
  require(
    './health'
  );

class RuntimeRouter {
  constructor({
    maxAttempts = 4,
    circuitThreshold = 3,
    circuitCooldownMs = 60000
  } = {}) {
    this.maxAttempts =
      maxAttempts;

    this.breaker =
      new CircuitBreaker({
        threshold:
          circuitThreshold,

        cooldownMs:
          circuitCooldownMs
      });
  }

  async infer({
    providers,
    messages,
    monthlySpentUsd = 0,
    monthlyCapUsd = 100,
    paidProviderAuthorized = false
  }) {
    const candidates =
      order(providers);

    const trace = [];

    let attempts = 0;

    for (
      const candidate of
      candidates
    ) {
      if (
        attempts >=
        this.maxAttempts
      ) break;

      const circuitState =
        this.breaker.status(
          candidate.id
        );

      if (
        circuitState === 'OPEN'
      ) {
        trace.push({
          provider:
            candidate.id,
          outcome:
            'CIRCUIT_OPEN'
        });

        continue;
      }

      const spend =
        authorizeSpend({
          monthlySpentUsd,
          projectedRequestUsd:
            candidate.projectedCostUsd,
          monthlyCapUsd,
          paidProviderAuthorized
        });

      if (!spend.authorized) {
        trace.push({
          provider:
            candidate.id,
          outcome:
            spend.reason
        });

        continue;
      }

      const adapter =
        get(candidate.id);

      if (!adapter) {
        trace.push({
          provider:
            candidate.id,
          outcome:
            'NO_ADAPTER'
        });

        continue;
      }

      attempts++;

      try {
        const result =
          await adapter.chat({
            model:
              candidate.model,
            messages,
            maxTokens:
              candidate.maxTokens ||
              2048
          });

        this.breaker
          .recordSuccess(
            candidate.id
          );

        trace.push({
          provider:
            candidate.id,
          outcome:
            'PASS'
        });

        return {
          ok: true,
          provider:
            candidate.id,
          model:
            result.model,
          text:
            result.text,
          usage:
            result.usage || null,
          trace
        };

      } catch (error) {
        this.breaker
          .recordFailure(
            candidate.id
          );

        const classified =
          health.classify(
            error
          );

        trace.push({
          provider:
            candidate.id,
          outcome:
            classified.state,
          fallbackEligible:
            classified
              .fallbackEligible
        });

        if (
          classified
            .fallbackEligible !==
          true
        ) {
          break;
        }
      }
    }

    return {
      ok: false,
      error:
        'NO_PROVIDER_SUCCEEDED',
      trace
    };
  }
}

module.exports = {
  RuntimeRouter
};
