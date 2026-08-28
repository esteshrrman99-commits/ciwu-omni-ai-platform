'use strict';

function normalize(event={}) {
  const timestamp=
    new Date(event.timestamp).getTime();

  return {
    id:String(event.id || ''),
    type:String(event.type || 'UNKNOWN'),
    actor:String(event.actor || 'SYSTEM'),
    summary:String(event.summary || ''),
    timestamp:
      Number.isFinite(timestamp)
        ? new Date(timestamp).toISOString()
        : null,
    evidenceHash:
      event.evidenceHash || null
  };
}

function order(events=[]) {
  return events
    .map(normalize)
    .sort((a,b) => {
      const at=
        a.timestamp
          ? new Date(a.timestamp).getTime()
          : 0;

      const bt=
        b.timestamp
          ? new Date(b.timestamp).getTime()
          : 0;

      return bt-at;
    });
}

module.exports={
  normalize,
  order
};
