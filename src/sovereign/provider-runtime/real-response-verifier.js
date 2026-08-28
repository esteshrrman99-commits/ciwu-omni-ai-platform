'use strict';

const crypto =
  require('node:crypto');

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(
      String(value ?? '')
    )
    .digest('hex');
}

function verify({
  provider,
  model,
  requestBody,
  responseBody,
  statusCode,
  latencyMs,
  realNetworkCall
}) {
  if (
    realNetworkCall !==
    true
  ) {
    return {
      certified: false,
      reason:
        'REAL_NETWORK_CALL_NOT_PROVEN'
    };
  }

  const status =
    Number(statusCode);

  if (
    !Number.isInteger(status)
  ) {
    return {
      certified: false,
      reason:
        'STATUS_CODE_INVALID'
    };
  }

  if (
    status < 200 ||
    status > 299
  ) {
    return {
      certified: false,
      reason:
        'PROVIDER_RESPONSE_NOT_SUCCESS'
    };
  }

  const latency =
    Number(latencyMs);

  if (
    !Number.isFinite(latency) ||
    latency < 0
  ) {
    return {
      certified: false,
      reason:
        'LATENCY_INVALID'
    };
  }

  if (
    responseBody === null ||
    responseBody === undefined ||
    String(responseBody).length ===
      0
  ) {
    return {
      certified: false,
      reason:
        'EMPTY_PROVIDER_RESPONSE'
    };
  }

  return {
    certified: true,

    evidence: {
      provider,
      model,
      statusCode:
        status,

      latencyMs:
        latency,

      requestHash:
        digest(
          requestBody
        ),

      responseHash:
        digest(
          responseBody
        ),

      realNetworkCall:
        true,

      verifiedAt:
        new Date()
          .toISOString()
    }
  };
}

module.exports = {
  digest,
  verify
};
