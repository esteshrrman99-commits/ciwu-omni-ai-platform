'use strict';

class SpendLedger {
  constructor({
    monthlyCapUsd = 100
  } = {}) {
    this.monthlyCapUsd = monthlyCapUsd;
    this.entries = [];
  }

  total() {
    return this.entries.reduce(
      (sum, x) => sum + x.amountUsd,
      0
    );
  }

  projected(amountUsd) {
    if (
      !Number.isFinite(amountUsd) ||
      amountUsd < 0
    ) return {
      allowed: false,
      reason: 'UNKNOWN_OR_INVALID_COST'
    };

    if (
      this.total() + amountUsd >
      this.monthlyCapUsd
    ) return {
      allowed: false,
      reason: 'MONTHLY_CAP_EXCEEDED'
    };

    return {
      allowed: true,
      reason:
        amountUsd === 0
          ? 'ZERO_COST'
          : 'WITHIN_CAP'
    };
  }

  record({
    provider,
    model,
    amountUsd,
    authorized
  }) {
    const projected =
      this.projected(amountUsd);

    if (!projected.allowed)
      throw new Error(projected.reason);

    if (
      amountUsd > 0 &&
      authorized !== true
    ) throw new Error(
      'PAID_SPEND_NOT_AUTHORIZED'
    );

    const entry = {
      provider,
      model,
      amountUsd,
      authorized:
        amountUsd === 0 || authorized === true,
      timestamp:
        new Date().toISOString()
    };

    this.entries.push(entry);
    return entry;
  }
}

module.exports = {
  SpendLedger
};
