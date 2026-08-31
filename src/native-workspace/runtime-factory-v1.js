'use strict';

const path = require('node:path');

const {
  ConversationStore
} = require('./conversation-store-v1');

const {
  ProjectMemoryStore
} = require('./project-memory-store-v1');

const {
  ProviderRegistry
} = require('./provider-registry-v1');

const {
  createChatService
} = require('./chat-service-v1');

const {
  createWorkspace
} = require('./workspace-service-v1');

const {
  DurableApprovalStore
} = require('./durable-approval-store-v1');

const {
  AuditLedger
} = require('./audit-ledger-v1');

const {
  TransactionJournal
} = require('./transaction-journal-v1');

const {
  ApprovalExecutorV2
} = require('./approval-executor-v2');

const {
  RecoveryService
} = require('./recovery-service-v1');

const {
  ImportProvenanceStore
} = require('./import-provenance-store-v1');

const {
  ImportMigrationService
} = require('./import-migration-service-v1');

const {
  ImportActivationLedger
} = require('./import-activation-ledger-v1');

const {
  ImportActiveConversationStore
} = require('./import-active-conversation-store-v1');

const {
  ImportSearchIndex
} = require('./import-search-index-v1');

const {
  ImportActivationService
} = require('./import-activation-service-v1');

const {
  ContextStateReader
} = require('./context-state-reader-v1');

const {
  UnifiedContextRetrieval
} = require('./unified-context-retrieval-v1');

const {
  ContextAssemblyService
} = require('./context-assembly-service-v1');

const {
  ModelDryRunService
} = require('./model-dry-run-service-v1');


const {
  ProviderCapabilityService
} = require(
  './provider-capability-service-v1'
);


const {
  LocalDryRunProviderAdapter
} = require(
  './local-dry-run-provider-adapter-v1'
);

const {
  ProviderDispatcher
} = require(
  './provider-dispatcher-v1'
);

const {
  ProviderDispatchService
} = require(
  './provider-dispatch-service-v1'
);
const {
  createNativeApi
} = require('./native-api-v1');

function createRuntime({
  projectRoot,
  stateRoot,
  projectId,
  providers = [],
  clock,
  faultInjector = null
}) {
  const effectiveClock =
    typeof clock === 'function'
      ? clock
      : () =>
          new Date().toISOString();

  const conversationStore =
    new ConversationStore(
      path.join(
        stateRoot,
        'conversations'
      )
    );

  const memoryStore =
    new ProjectMemoryStore(
      path.join(
        stateRoot,
        'memory'
      )
    );

  const providerRegistry =
    new ProviderRegistry();

  for (const provider of providers) {
    providerRegistry.register(
      provider.name,
      provider.adapter,
      provider.metadata
    );
  }

  const chatService =
    createChatService({
      conversationStore,
      memoryStore,
      providerRegistry
    });

  const workspace =
    createWorkspace(
      projectRoot
    );

  const approvalStore =
    new DurableApprovalStore(
      path.join(
        stateRoot,
        'approvals',
        'tickets.json'
      )
    );

  const auditLedger =
    new AuditLedger(
      path.join(
        stateRoot,
        'audit',
        'transactions.jsonl'
      )
    );

  const journal =
    new TransactionJournal(
      path.join(
        stateRoot,
        'transactions'
      )
    );

  const approvalExecutor =
    new ApprovalExecutorV2({
      workspace,
      projectRoot,
      approvalStore,
      auditLedger,
      journal,
      clock:
        effectiveClock,
      faultInjector
    });

  const importProvenanceStore =
    new ImportProvenanceStore(
      path.join(
        stateRoot,
        'imports'
      )
    );

  const importMigrationService =
    new ImportMigrationService({
      provenanceStore:
        importProvenanceStore,
      clock:
        effectiveClock
    });

  const importActiveStore =
    new ImportActiveConversationStore(
      path.join(
        stateRoot,
        'conversations',
        'imported-active'
      )
    );

  const importActivationLedger =
    new ImportActivationLedger(
      path.join(
        stateRoot,
        'imports',
        'activation-ledger.json'
      )
    );

  const importSearchIndex =
    new ImportSearchIndex(
      importActiveStore
    );

  const importActivationService =
    new ImportActivationService({
      migrationService:
        importMigrationService,
      activeStore:
        importActiveStore,
      activationLedger:
        importActivationLedger,
      searchIndex:
        importSearchIndex,
      clock:
        effectiveClock
    });

  const contextStateReader =
    new ContextStateReader(
      stateRoot
    );

  const unifiedContextRetrieval =
    new UnifiedContextRetrieval({
      stateReader:
        contextStateReader,
      importActivationService
    });

  const contextAssemblyService =
    new ContextAssemblyService({
      unifiedContextRetrieval
    });


  const recoveryService =
    new RecoveryService({
      approvalStore,
      journal,
      auditLedger,
      clock:
        effectiveClock
    });

  const modelDryRunService =
    new ModelDryRunService({
      contextAssemblyService,
      clock:
        effectiveClock
    });

  const providerCapabilityService =
    new ProviderCapabilityService({
      configuredProviders:[],
      globalNetworkEnabled:false,
      providerAllowlist:[]
    });

  const localDryRunProviderAdapter =
    new LocalDryRunProviderAdapter();

  const providerDispatcher =
    new ProviderDispatcher({
      adapters:[
        localDryRunProviderAdapter
      ]
    });

  const providerDispatchService =
    new ProviderDispatchService({
      providerCapabilityService,
      providerDispatcher:
        undefined,
      dispatcher:
        providerDispatcher
    });

  const api =
    createNativeApi({
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
      clock:
        effectiveClock
    });

  return {
    conversationStore,
    memoryStore,
    providerRegistry,
    chatService,
    workspace,
    approvalStore,
    auditLedger,
    journal,
    approvalExecutor,
    recoveryService,
    importProvenanceStore,
    importMigrationService,
    importActiveStore,
    importActivationLedger,
    importSearchIndex,
    importActivationService,
    contextStateReader,
    unifiedContextRetrieval,
    contextAssemblyService,
    modelDryRunService,
    providerCapabilityService,
    providerDispatchService,
    api
  };
}

module.exports = {
  createRuntime
};
