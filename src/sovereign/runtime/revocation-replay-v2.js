'use strict';

function replay({
  provider,
  model,
  events = []
}) {
  let revoked=false;
  let reason=null;
  let generation=0;

  for (const event of events) {
    if (
      event.provider !== provider ||
      event.model !== model
    ) {
      continue;
    }

    if (event.type === 'REVOKE') {
      revoked=true;
      reason=
        event.reason ||
        'UNSPECIFIED';
      generation += 1;
    }

    if (
      event.type ===
      'RECERTIFY'
    ) {
      if (
        event.certified === true
      ) {
        revoked=false;
        reason=null;
        generation += 1;
      }
    }
  }

  return {
    provider,
    model,
    revoked,
    reason,
    generation,

    runtimeEligible:
      !revoked
  };
}

module.exports = {
  replay
};
