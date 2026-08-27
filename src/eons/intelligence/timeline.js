'use strict';

class Timeline {
  constructor() {
    this.map = new Map();
  }

  add(sessionId, event = {}) {
    const id =
      String(sessionId || 'default');

    if (!this.map.has(id)) {
      this.map.set(id, []);
    }

    const record = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      at:
        event.at ||
        new Date().toISOString(),
      type:
        event.type || 'NOTE',
      label:
        event.label || '',
      data:
        event.data || null,
      sourceClass:
        event.sourceClass ||
        'USER_PROVIDED'
    };

    this.map.get(id).push(record);

    this.map
      .get(id)
      .sort((a, b) =>
        new Date(a.at) -
        new Date(b.at)
      );

    return record;
  }

  list(sessionId) {
    return (
      this.map.get(
        String(sessionId || 'default')
      ) || []
    );
  }

  clear(sessionId) {
    this.map.delete(
      String(sessionId || 'default')
    );
  }
}

module.exports = new Timeline();
