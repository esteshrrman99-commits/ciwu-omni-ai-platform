'use strict';

const {
  assemble
} = require('./context-assembler-v1');

const {
  complete
} = require('./provider-bridge-v1');

const {
  classify
} = require('./tool-request-policy-v1');

const {
  buildEnvelope
} = require('./assistant-envelope-v1');

async function runSession({
  projectId,
  conversationId,
  userContent,
  timestamp,
  providerName,
  conversationStore,
  memoryStore,
  providerRegistry
}) {
  if (
    typeof userContent !== 'string' ||
    userContent.length === 0
  ) {
    throw new Error('USER_CONTENT_REQUIRED');
  }

  let conversation =
    conversationStore.get(projectId, conversationId);

  if (!conversation) {
    conversationStore.create(
      projectId,
      conversationId,
      timestamp
    );
  }

  conversationStore.append(
    projectId,
    conversationId,
    {
      role: 'user',
      content: userContent
    },
    timestamp
  );

  const memoryState =
    memoryStore.all(projectId);

  const memoryContext =
    assemble(
      memoryState,
      userContent,
      5
    );

  const history =
    conversationStore
      .get(projectId, conversationId)
      .messages
      .map(message => ({
        role: message.role,
        content: message.content
      }));

  const providerResult = await complete(
    providerRegistry,
    providerName,
    {
      project_id: projectId,
      conversation_id: conversationId,
      messages: history,
      memory_context:
        memoryContext.ok
          ? memoryContext.context
          : []
    }
  );

  if (!providerResult.ok) {
    return providerResult;
  }

  const classifiedTools =
    classify(providerResult.tool_requests);

  conversationStore.append(
    projectId,
    conversationId,
    {
      role: 'assistant',
      content: providerResult.content
    },
    timestamp
  );

  return {
    ok: true,
    envelope: buildEnvelope({
      provider: providerResult.provider,
      content: providerResult.content,
      memoryContext:
        memoryContext.ok
          ? memoryContext.context
          : [],
      toolRequests: classifiedTools,
      conversationId,
      projectId
    })
  };
}

module.exports = {
  runSession
};
