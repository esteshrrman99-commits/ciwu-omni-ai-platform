'use strict';

function fuseIndependent(
  records
) {
  const groups =
    new Map();

  for (
    const record of
    records
  ) {
    if (!record.sourceGroup) {
      throw new Error(
        'SOURCE_GROUP_REQUIRED'
      );
    }

    const confidence =
      Number(
        record.confidence
      );

    if (
      !Number.isFinite(
        confidence
      ) ||
      confidence < 0 ||
      confidence > 1
    ) {
      throw new Error(
        'INVALID_CONFIDENCE'
      );
    }

    groups.set(
      record.sourceGroup,

      Math.max(
        groups.get(
          record.sourceGroup
        ) || 0,

        confidence
      )
    );
  }

  let remaining = 1;

  for (
    const confidence of
    groups.values()
  ) {
    remaining *=
      1 - confidence;
  }

  return 1 - remaining;
}

module.exports = {
  fuseIndependent
};
