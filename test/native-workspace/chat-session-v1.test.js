'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  ConversationStore
} = require('../../src/native-workspace/conversation-store-v1');

const {
  ProjectMemoryStore
} = require('../../src/native-workspace/project-memory-store-v1');

const {
  ProviderRegistry
} = require('../../src/native-workspace/provider-registry-v1');

const {
  createChatService
} = require('../../src/native-workspace/chat-service-v1');

test('native chat session persists context and never auto-executes tools', async () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-chat-')
  );

  try {
    const conversations =
      new ConversationStore(
        path.join(root, 'conversations')
      );

    const memory =
      new ProjectMemoryStore(
        path.join(root, 'memory')
      );

    memory.put('ciwu', {
      id: 'm1',
      class: 'PROJECT_FACT',
      content: 'CIWU native workspace uses explicit authorization',
      provenance: 'authority-v1',
      confidence: 1,
      timestamp: '2026-08-30T21:00:00Z'
    });

    const providers =
      new ProviderRegistry();

    providers.register(
      'MOCK',
      {
        async complete(request) {
          assert.equal(
            Array.isArray(request.messages),
            true
          );

          assert.equal(
            request.memory_context.length >= 1,
            true
          );

          return {
            content: 'I can inspect the workspace.',
            tool_requests: [
              {
                action: 'READ',
                path: 'package.json'
              },
              {
                action: 'UPDATE',
                path: 'src/example.js'
              }
            ]
          };
        }
      },
      {
        enabled: true,
        healthy: true,
        server_side: true
      }
    );

    const chat =
      createChatService({
        conversationStore: conversations,
        memoryStore: memory,
        providerRegistry: providers
      });

    const result = await chat.send({
      projectId: 'ciwu',
      conversationId: 'c1',
      userContent:
        'Use explicit authorization in the workspace',
      timestamp: '2026-08-30T21:01:00Z',
      providerName: 'MOCK'
    });

    assert.equal(result.ok, true);
    assert.equal(
      result.envelope.content,
      'I can inspect the workspace.'
    );

    assert.equal(
      result.envelope.tool_execution,
      'NOT_EXECUTED'
    );

    assert.equal(
      result.envelope.tool_requests.length,
      2
    );

    assert.equal(
      result.envelope.tool_requests[0].authority,
      'READ'
    );

    assert.equal(
      result.envelope.tool_requests[1].authority,
      'WRITE'
    );

    assert.equal(
      result.envelope.tool_requests[1].execution_status,
      'PENDING_EXPLICIT_AUTHORIZATION'
    );

    const stored =
      conversations.get('ciwu', 'c1');

    assert.equal(stored.messages.length, 2);
    assert.equal(stored.messages[0].role, 'user');
    assert.equal(stored.messages[1].role, 'assistant');

    console.log(
      'CIWU_NATIVE_CHAT_SESSION_ORCHESTRATION_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
