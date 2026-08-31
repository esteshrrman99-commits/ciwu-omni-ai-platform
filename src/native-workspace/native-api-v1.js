'use strict';

const {
  previewReplace
} = require('./edit-preview-v1');

const {
  classify
} = require('./tool-request-policy-v1');

function createNativeApi({
  projectRoot,
  projectId,
  workspace,
  chatService,
  memoryStore,
  approvalStore,
  approvalExecutor,
  auditLedger,
  recoveryService,
  importMigrationService,
  importActivationService,
  unifiedContextRetrieval,
  contextAssemblyService,
  modelDryRunService,
  providerCapabilityService,
  providerDispatchService,
  clock = () => new Date().toISOString()
}) {
  if (
    !projectRoot ||
    !projectId ||
    !workspace ||
    !chatService ||
    !memoryStore ||
    !approvalStore
  ) {
    throw new Error(
      'API_DEPENDENCIES_REQUIRED'
    );
  }

  return {
    async health() {
      return {
        ok: true,
        service:
          'CIWU_NATIVE_WORKSPACE',
        version: 2,
        authority: {
          read: true,
          preview: true,
          approval: true,
          write_http:
            Boolean(approvalExecutor),
          execute_http:
            Boolean(approvalExecutor),
          commit_http: false,
          push_http: false,
          deploy_http: false
        },
        mutation_policy:
          'APPROVAL_BOUND_ONE_TIME'
      };
    },

    async workspaceList(
      relative = '.'
    ) {
      return {
        ok: true,
        path: relative,
        entries:
          workspace.list(relative)
      };
    },

    async workspaceRead(
      relative
    ) {
      return {
        ok: true,
        path: relative,
        content:
          workspace.read(relative),
        metadata:
          workspace.metadata(relative)
      };
    },

    async editPreview(
      relative,
      content
    ) {
      return {
        ok: true,
        preview:
          previewReplace(
            projectRoot,
            relative,
            content
          ),
        execution_status:
          'NOT_EXECUTED'
      };
    },

    async memory(query = '') {
      const state =
        memoryStore.all(projectId);

      if (!query) {
        return {
          ok: true,
          project_id: projectId,
          revision: state.revision,
          count:
            state.records.length,
          records:
            state.records
        };
      }

      const {
        assemble
      } = require(
        './context-assembler-v1'
      );

      return assemble(
        state,
        query,
        10
      );
    },

    async chat(body) {
      return chatService.send({
        projectId,
        conversationId:
          body.conversation_id,
        userContent:
          body.content,
        timestamp:
          clock(),
        providerName:
          body.provider
      });
    },

    async requestApproval(body) {
      const classified =
        classify([{
          action: body.action
        }])[0];

      if (!classified.accepted) {
        return {
          ok: false,
          reason:
            classified.reason
        };
      }

      if (
        classified.authority ===
        'READ'
      ) {
        return {
          ok: false,
          reason:
            'READ_DOES_NOT_REQUIRE_APPROVAL'
        };
      }

      if (
        ['COMMIT', 'PUSH', 'DEPLOY']
          .includes(body.action)
      ) {
        return {
          ok: false,
          reason:
            'RELEASE_AUTHORITY_NOT_EXPOSED'
        };
      }

      const ticket =
        approvalStore.create({
          action: body.action,
          payload:
            body.payload || {}
        }, clock());

      return {
        ok: true,
        ticket,
        authority:
          classified.authority,
        execution_status:
          'NOT_EXECUTED'
      };
    },

    async decideApproval(
      id,
      decision
    ) {
      return {
        ok: true,
        ticket:
          approvalStore.decide(
            id,
            decision,
            clock()
          ),
        execution_status:
          'NOT_EXECUTED'
      };
    },

    async executeApproved(
      id,
      body
    ) {
      if (!approvalExecutor) {
        return {
          ok: false,
          reason:
            'MUTATION_EXECUTOR_DISABLED'
        };
      }

      try {
        return approvalExecutor.execute(
          id,
          {
            action:
              body.action,
            payload:
              body.payload
          }
        );
      } catch (error) {
        return {
          ok: false,
          reason:
            error &&
            error.message
              ? error.message
              : 'TRANSACTION_FAILED'
        };
      }
    },

    async stageImport(
      body
    ) {
      if (!importMigrationService) {
        return {
          ok:false,
          reason:
            'IMPORT_SERVICE_DISABLED'
        };
      }

      try {
        return importMigrationService.stage(
          body.payload,
          {
            source_name:
              body.source_name ||
              'conversation-import.json'
          }
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'IMPORT_FAILED'
        };
      }
    },

    async getImport(
      sourceSha
    ) {
      if (!importMigrationService) {
        return {
          ok:false,
          reason:
            'IMPORT_SERVICE_DISABLED'
        };
      }

      try {
        return importMigrationService.get(
          sourceSha
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'IMPORT_LOOKUP_FAILED'
        };
      }
    },

    async activateImport(
      sourceSha
    ) {
      if (!importActivationService) {
        return {
          ok:false,
          reason:
            'IMPORT_ACTIVATION_DISABLED'
        };
      }

      try {
        return importActivationService.activate(
          sourceSha
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'IMPORT_ACTIVATION_FAILED'
        };
      }
    },

    async importActivationStatus(
      sourceSha
    ) {
      if (!importActivationService) {
        return {
          ok:false,
          reason:
            'IMPORT_ACTIVATION_DISABLED'
        };
      }

      try {
        return importActivationService.status(
          sourceSha
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'IMPORT_ACTIVATION_STATUS_FAILED'
        };
      }
    },

    async searchImportedHistory(
      body
    ) {
      if (!importActivationService) {
        return {
          ok:false,
          reason:
            'IMPORT_SEARCH_DISABLED'
        };
      }

      return importActivationService.search(
        body.query || '',
        body.limit || 20
      );
    },

    async searchUnifiedContext(
      body
    ) {
      if (!unifiedContextRetrieval) {
        return {
          ok:false,
          reason:
            'UNIFIED_CONTEXT_DISABLED'
        };
      }

      try {
        return unifiedContextRetrieval.search(
          body.query || '',
          body.limit || 20
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'UNIFIED_CONTEXT_SEARCH_FAILED'
        };
      }
    },

    async assembleContext(
      body
    ) {
      if (!contextAssemblyService) {
        return {
          ok:false,
          reason:
            'CONTEXT_ASSEMBLY_DISABLED'
        };
      }

      try {
        return contextAssemblyService.assemble({
          current_instruction:
            body.current_instruction,
          query:
            body.query,
          limit:
            body.limit || 40,
          budget:
            body.budget || {}
        });
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'CONTEXT_ASSEMBLY_FAILED'
        };
      }
    },

    async providerDispatch(
      body
    ) {
      if (!providerDispatchService) {
        return {
          ok:false,
          reason:
            'PROVIDER_DISPATCH_SERVICE_DISABLED',
          model_network_call:false
        };
      }

      try {
        return await providerDispatchService.dispatch(
          body || {}
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'PROVIDER_DISPATCH_FAILED',
          model_network_call:false,
          external_provider_called:false,
          real_provider_credential_used:false
        };
      }
    },

    async providerPolicy(
      body
    ) {
      if (!providerCapabilityService) {
        return {
          ok:false,
          reason:
            'PROVIDER_CAPABILITY_SERVICE_DISABLED'
        };
      }

      try {
        return providerCapabilityService.evaluate(
          body || {}
        );
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'PROVIDER_POLICY_EVALUATION_FAILED'
        };
      }
    },

    async modelDryRun(
      body
    ) {
      if (!modelDryRunService) {
        return {
          ok:false,
          reason:
            'MODEL_DRY_RUN_DISABLED'
        };
      }

      try {
        return modelDryRunService.run({
          current_instruction:
            body.current_instruction,
          query:
            body.query,
          requested_provider:
            body.requested_provider,
          requested_model:
            body.requested_model,
          metadata:
            body.metadata || {},
          budget:
            body.budget || {}
        });
      } catch (error) {
        return {
          ok:false,
          reason:
            error.message ||
            'MODEL_DRY_RUN_FAILED'
        };
      }
    },

    async recoveryStatus(
      id
    ) {
      if (!recoveryService) {
        return {
          ok: false,
          reason:
            'RECOVERY_SERVICE_DISABLED'
        };
      }

      return recoveryService.status(
        id
      );
    },

    async resolveRecovery(
      id,
      body
    ) {
      if (!recoveryService) {
        return {
          ok: false,
          reason:
            'RECOVERY_SERVICE_DISABLED'
        };
      }

      return recoveryService.resolve(
        id,
        body.resolution,
        body.note || ''
      );
    },

    async auditStatus() {
      if (!auditLedger) {
        return {
          ok: false,
          reason:
            'AUDIT_LEDGER_DISABLED'
        };
      }

      const verification =
        auditLedger.verify();

      return {
        ok: true,
        verification,
        records:
          auditLedger.records()
      };
    }
  };
}

module.exports = {
  createNativeApi
};
