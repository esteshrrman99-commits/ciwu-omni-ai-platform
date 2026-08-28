'use strict';

const {
  PersistentMemory
} = require(
  './persistent-memory'
);

class ProjectBrain {
  constructor(file) {
    this.memory =
      new PersistentMemory(
        file
      );
  }

  rememberFact({
    content,
    provenance,
    confidence = 1,
    tags = []
  }) {
    return this.memory
      .append({
        type:
          'PROJECT_FACT',
        content,
        provenance,
        confidence,
        tags
      });
  }

  rememberDecision({
    content,
    provenance,
    confidence = 1,
    tags = []
  }) {
    return this.memory
      .append({
        type:
          'PROJECT_DECISION',
        content,
        provenance,
        confidence,
        tags
      });
  }

  rememberFailure({
    content,
    provenance,
    confidence = 1,
    tags = []
  }) {
    return this.memory
      .append({
        type:
          'FAILURE',
        content,
        provenance,
        confidence,
        tags
      });
  }

  rememberCertification({
    content,
    provenance,
    confidence = 1,
    tags = []
  }) {
    return this.memory
      .append({
        type:
          'CERTIFICATION',
        content,
        provenance,
        confidence,
        tags
      });
  }

  search(query) {
    return this.memory
      .search(query);
  }

  timeline() {
    return this.memory
      .records()
      .sort(
        (a,b) =>
          a.timestamp
            .localeCompare(
              b.timestamp
            )
      );
  }
}

module.exports = {
  ProjectBrain
};
