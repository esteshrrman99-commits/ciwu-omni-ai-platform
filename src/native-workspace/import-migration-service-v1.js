'use strict';

const {
  normalizeImport
} = require(
  './import-normalizer-v1'
);

const {
  assertImportIsInert
} = require(
  './import-authority-boundary-v1'
);

class ImportMigrationService {
  constructor({
    provenanceStore,
    clock =
      () => new Date().toISOString()
  }) {
    if (!provenanceStore) {
      throw new Error(
        'IMPORT_PROVENANCE_STORE_REQUIRED'
      );
    }

    this.provenanceStore =
      provenanceStore;

    this.clock =
      clock;
  }

  stage(
    payload,
    metadata = {}
  ) {
    const normalized =
      normalizeImport(
        payload,
        metadata
      );

    for (
      const conversation of
      normalized.conversations
    ) {
      for (
        const message of
        conversation.messages
      ) {
        assertImportIsInert(
          message
        );
      }
    }

    const result =
      this.provenanceStore.create({
        ...normalized,
        imported_at:
          this.clock()
      });

    return {
      ok:true,
      created:
        result.created,
      duplicate:
        !result.created,
      import_id:
        result.record.import_id,
      source_sha256:
        result.record.source_sha256,
      conversation_count:
        result.record
          .conversation_count,
      message_count:
        result.record
          .message_count,
      import_authority:
        result.record
          .import_authority,
      imported_content_inert:
        true,
      tool_execution_allowed:
        false,
      mutation_authority:
        false
    };
  }

  get(sourceSha) {
    const record =
      this.provenanceStore.get(
        sourceSha
      );

    if (!record) {
      return {
        ok:false,
        reason:
          'IMPORT_SOURCE_NOT_FOUND'
      };
    }

    return {
      ok:true,
      record
    };
  }
}

module.exports = {
  ImportMigrationService
};
