'use strict';

const {
  runSession
} = require('./session-orchestrator-v1');

function createChatService(dependencies) {
  if (
    !dependencies ||
    !dependencies.conversationStore ||
    !dependencies.memoryStore ||
    !dependencies.providerRegistry
  ) {
    throw new Error('CHAT_DEPENDENCIES_REQUIRED');
  }

  return {
    async send(request) {
      return runSession({
        ...request,
        conversationStore:
          dependencies.conversationStore,
        memoryStore:
          dependencies.memoryStore,
        providerRegistry:
          dependencies.providerRegistry
      });
    }
  };
}

module.exports = {
  createChatService
};
