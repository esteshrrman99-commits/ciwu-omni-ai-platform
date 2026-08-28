'use strict';

function cents(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    throw new Error(
      'INVALID_USD_AMOUNT'
    );
  }

  return Math.round(
    number * 100
  );
}

function create({
  monthlyHardCapUsd = 100,
  monthlySpentUsd = 0,
  monthlyReservedUsd = 0
} = {}) {
  const hardCapCents =
    cents(monthlyHardCapUsd);

  const spentCents =
    cents(monthlySpentUsd);

  const reservedCents =
    cents(monthlyReservedUsd);

  if (
    spentCents +
    reservedCents >
    hardCapCents
  ) {
    throw new Error(
      'INITIAL_BUDGET_OVERALLOCATED'
    );
  }

  let reserved =
    reservedCents;

  let spent =
    spentCents;

  function snapshot() {
    return {
      hardCapUsd:
        hardCapCents / 100,

      spentUsd:
        spent / 100,

      reservedUsd:
        reserved / 100,

      availableUsd:
        (
          hardCapCents -
          spent -
          reserved
        ) / 100
    };
  }

  function reserve({
    estimatedCostUsd,
    paidAuthorization = false
  }) {
    const amount =
      cents(estimatedCostUsd);

    if (
      amount > 0 &&
      paidAuthorization !== true
    ) {
      return {
        allowed: false,
        reason:
          'PAID_AUTHORIZATION_REQUIRED'
      };
    }

    if (
      spent +
      reserved +
      amount >
      hardCapCents
    ) {
      return {
        allowed: false,
        reason:
          'MONTHLY_HARD_CAP_EXCEEDED'
      };
    }

    reserved += amount;

    return {
      allowed: true,
      reservedUsd:
        amount / 100,
      budget:
        snapshot()
    };
  }

  function settle({
    reservedUsd,
    observedCostUsd
  }) {
    const reservation =
      cents(reservedUsd);

    const observed =
      cents(observedCostUsd);

    if (
      reservation >
      reserved
    ) {
      throw new Error(
        'RESERVATION_NOT_FOUND'
      );
    }

    if (
      spent -
      0 +
      observed >
      hardCapCents
    ) {
      throw new Error(
        'OBSERVED_COST_EXCEEDS_HARD_CAP'
      );
    }

    reserved -=
      reservation;

    spent +=
      observed;

    if (
      spent +
      reserved >
      hardCapCents
    ) {
      throw new Error(
        'POST_SETTLEMENT_OVER_CAP'
      );
    }

    return snapshot();
  }

  function release({
    reservedUsd
  }) {
    const amount =
      cents(reservedUsd);

    if (amount > reserved) {
      throw new Error(
        'RESERVATION_NOT_FOUND'
      );
    }

    reserved -= amount;

    return snapshot();
  }

  return {
    reserve,
    settle,
    release,
    snapshot
  };
}

module.exports = {
  cents,
  create
};
