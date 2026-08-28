'use strict';

function decide({
  posterior,
  evidenceValid,
  regressionValid,
  provenanceValid,
  revoked=false
}) {
  if (revoked === true) {
    return {
      state:'REVOKED',
      promotable:false
    };
  }

  if (
    evidenceValid !== true ||
    regressionValid !== true ||
    provenanceValid !== true
  ) {
    return {
      state:'QUARANTINED',
      promotable:false
    };
  }

  const score=Number(posterior);

  if (!Number.isFinite(score)) {
    return {
      state:'REJECTED',
      promotable:false
    };
  }

  if (score >= 0.65) {
    return {
      state:'ACTIVE',
      promotable:true
    };
  }

  if (score >= 0.25) {
    return {
      state:'QUARANTINED',
      promotable:false
    };
  }

  return {
    state:'REJECTED',
    promotable:false
  };
}

module.exports={ decide };
