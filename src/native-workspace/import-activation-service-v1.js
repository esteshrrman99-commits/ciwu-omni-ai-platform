'use strict';

class ImportActivationService {
  constructor({
    migrationService,
    activeStore,
    activationLedger,
    searchIndex,
    clock =
      () => new Date().toISOString()
  }) {
    if (
      !migrationService ||
      !activeStore ||
      !activationLedger ||
      !searchIndex
    ) {
      throw new Error(
        'IMPORT_ACTIVATION_DEPENDENCIES_REQUIRED'
      );
    }

    this.migrationService =
      migrationService;

    this.activeStore =
      activeStore;

    this.activationLedger =
      activationLedger;

    this.searchIndex =
      searchIndex;

    this.clock = clock;
  }

  activate(sourceSha) {
    const prior =
      this.activationLedger.get(
        sourceSha
      );

    if (prior) {
      if (
        this.activeStore &&
        typeof this.activeStore.hasPreparedVisibility ===
          'function' &&
        this.activeStore.hasPreparedVisibility(
          sourceSha
        )
      ) {
        this.activeStore
          .commitPreparedVisibility(
            sourceSha
          );
      }

      return {
        ok:true,
        created:false,
        duplicate_activation:true,
        source_sha256:
          sourceSha,
        conversation_count:
          prior.conversation_count,
        message_count:
          prior.message_count
      };
    }

    const staged =
      this.migrationService.get(
        sourceSha
      );

    if (!staged.ok) {
      return staged;
    }

    const record =
      staged.record;

    if (
      record.import_authority !==
        'READ_IMPORT_ONLY' ||
      record.imported_content_inert !==
        true ||
      record.tool_execution_allowed !==
        false ||
      record.mutation_authority !==
        false
    ) {
      return {
        ok:false,
        reason:
          'IMPORT_ACTIVATION_AUTHORITY_INVALID'
      };
    }

    let conversations = 0;
    let messages = 0;

    for (
      const conversation of
      record.conversations
    ) {
      for (
        const message of
        conversation.messages
      ) {
        if (
          message.import_authority !==
            'READ_IMPORT_ONLY' ||
          message.imported_content_inert !==
            true ||
          message.tool_execution_allowed !==
            false ||
          message.mutation_authority !==
            false ||
          !message.provenance ||
          message.provenance
            .source_sha256 !==
            sourceSha
        ) {
          return {
            ok:false,
            reason:
              'IMPORT_MESSAGE_PROVENANCE_INVALID'
          };
        }
      }

      this.activeStore.put(
        sourceSha,
        conversation
      );

      conversations += 1;
      messages +=
        conversation.messages.length;
    }

    const activation = {
      source_sha256:
        sourceSha,
      activated_at:
        this.clock(),
      conversation_count:
        conversations,
      message_count:
        messages,
      activation_mode:
        'LOGICAL_NATIVE_MERGE',
      import_authority:
        'READ_IMPORT_ONLY',
      imported_content_inert:
        true,
      tool_execution_allowed:
        false,
      mutation_authority:
        false
    };

    this._recordCommittedActivation(
      activation
    );

    return {
      ok:true,
      created:true,
      duplicate_activation:false,
      ...activation
    };
  }

  status(sourceSha) {
    const activation =
      this.activationLedger.get(
        sourceSha
      );

    if (!activation) {
      return {
        ok:true,
        activated:false,
        source_sha256:
          sourceSha
      };
    }

    return {
      ok:true,
      activated:true,
      ...activation
    };
  }

  search(query, limit) {
    return {
      ok:true,
      authority:
        'READ_IMPORT_ONLY',
      results:
        this.searchIndex.search(
          query,
          limit
        )
    };
  }
  _recordCommittedActivation(record) {
    if (
      !this.activeStore ||
      typeof this.activeStore.prepareVisibility !==
        'function' ||
      typeof this.activeStore.commitPreparedVisibility !==
        'function'
    ) {
      throw new Error(
        'IMPORT_VISIBILITY_GATE_UNAVAILABLE'
      );
    }

    /*
     * Phase 1:
     * hash-bind the fully written active payload,
     * but it remains invisible.
     */
    this.activeStore
      .prepareVisibility(
        record.source_sha256
      );

    /*
     * Phase 2:
     * existing durable activation ledger commit.
     */
    const result =
      this.activationLedger
        .record(record);

    /*
     * Phase 3:
     * only after the ledger exists may the already
     * hash-bound prepared proof become COMMITTED.
     */
    this.activeStore
      .commitPreparedVisibility(
        record.source_sha256
      );

    return result;
  }
}

module.exports = {
  ImportActivationService
};
