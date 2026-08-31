'use strict';

const path = require('node:path');

const {
  ensureDir,
  readJson,
  atomicWriteJson
} = require('./atomic-store-v1');

const {
  validateMemory
} = require('./memory-kernel-v1');

const {
  safeId
} = require('./conversation-store-v1');

class ProjectMemoryStore {
  constructor(root) {
    this.root = path.resolve(root);
    ensureDir(this.root);
  }

  file(projectId) {
    return path.join(
      this.root,
      safeId(projectId) + '.json'
    );
  }

  all(projectId) {
    const state = readJson(this.file(projectId), {
      schema: 'CIWU_NATIVE_MEMORY_STORE_V1',
      project_id: safeId(projectId),
      revision: 0,
      records: []
    });

    return state;
  }

  put(projectId, record) {
    const validation = validateMemory(record);

    if (!validation.ok) {
      const error = new Error(validation.reason);
      error.validation = validation;
      throw error;
    }

    const state = this.all(projectId);

    if (state.records.some(item => item.id === record.id)) {
      throw new Error('MEMORY_ID_EXISTS');
    }

    state.records.push({
      ...record,
      project_id: safeId(projectId)
    });

    state.revision += 1;

    atomicWriteJson(this.file(projectId), state);

    return record;
  }
}

module.exports = {
  ProjectMemoryStore
};
