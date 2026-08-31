'use strict';

function buildEnvelope({
  provider,
  content,
  memoryContext = [],
  toolRequests = [],
  conversationId,
  projectId
}) {
  return {
    schema: 'CIWU_NATIVE_ASSISTANT_RESPONSE_V1',
    project_id: projectId,
    conversation_id: conversationId,
    provider,
    content,
    memory_context: memoryContext,
    tool_requests: toolRequests,
    tool_execution: 'NOT_EXECUTED',
    authority_required: toolRequests.length
      ? true
      : false
  };
}

module.exports = {
  buildEnvelope
};
