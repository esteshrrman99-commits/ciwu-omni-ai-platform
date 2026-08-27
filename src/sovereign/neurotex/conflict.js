'use strict';

function detect(records) {
  const byKey =
    new Map();

  const conflicts = [];

  for (
    const record of
    records
  ) {
    const key =
      `${record.type}:${record.key || ''}`;

    if (!byKey.has(key)) {
      byKey.set(
        key,
        record
      );
      continue;
    }

    const previous =
      byKey.get(key);

    if (
      previous.content !==
      record.content
    ) {
      conflicts.push({
        key,
        previous,
        current: record
      });
    }
  }

  return conflicts;
}

module.exports = {
  detect
};
