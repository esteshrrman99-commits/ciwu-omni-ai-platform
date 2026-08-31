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
  retrieve
} = require('../../src/native-workspace/retrieval-v1');

const {
  assemble
} = require('../../src/native-workspace/context-assembler-v1');

const {
  verifyConversation
} = require('../../src/native-workspace/recovery-v1');

test('persistent conversation and project memory survive restart', () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-native-')
  );

  try {
    const conversations = path.join(root, 'conversations');
    const memories = path.join(root, 'memory');

    const c1 = new ConversationStore(conversations);

    c1.create(
      'project-alpha',
      'conversation-001',
      '2026-08-30T20:00:00Z'
    );

    c1.append(
      'project-alpha',
      'conversation-001',
      {
        role: 'user',
        content: 'Build persistent project memory'
      },
      '2026-08-30T20:01:00Z'
    );

    c1.append(
      'project-alpha',
      'conversation-001',
      {
        role: 'assistant',
        content: 'Persistent memory foundation created'
      },
      '2026-08-30T20:02:00Z'
    );

    const first =
      c1.get('project-alpha', 'conversation-001');

    assert.equal(first.messages.length, 2);
    assert.equal(verifyConversation(first).ok, true);

    // Simulated process restart: construct fresh stores.
    const c2 = new ConversationStore(conversations);

    const recovered =
      c2.get('project-alpha', 'conversation-001');

    assert.equal(recovered.messages.length, 2);
    assert.equal(
      recovered.messages[0].content,
      'Build persistent project memory'
    );

    assert.equal(
      verifyConversation(recovered).ok,
      true
    );

    const memory1 = new ProjectMemoryStore(memories);

    memory1.put('project-alpha', {
      id: 'memory-001',
      class: 'PROJECT_FACT',
      content: 'CIWU uses persistent project memory',
      provenance: 'conversation-001',
      confidence: 1,
      timestamp: '2026-08-30T20:03:00Z'
    });

    memory1.put('project-alpha', {
      id: 'memory-002',
      class: 'CONSTRAINT',
      content: 'Deployment requires explicit authorization',
      provenance: 'authority-v1',
      confidence: 1,
      timestamp: '2026-08-30T20:04:00Z'
    });

    const memory2 = new ProjectMemoryStore(memories);
    const state = memory2.all('project-alpha');

    assert.equal(state.records.length, 2);

    const hits = retrieve(
      state.records,
      'persistent project memory',
      5
    );

    assert.equal(hits.length >= 1, true);
    assert.equal(hits[0].record.id, 'memory-001');

    const context = assemble(
      state,
      'deployment authorization',
      5
    );

    assert.equal(context.ok, true);
    assert.equal(context.context.length, 1);
    assert.equal(
      context.context[0].provenance,
      'authority-v1'
    );

    assert.throws(
      () => memory2.put('project-alpha', {
        id: 'memory-bad'
      }),
      /MISSING_REQUIRED_MEMORY_FIELDS/
    );

    assert.throws(
      () => memory2.put('project-alpha', {
        id: 'memory-001',
        class: 'PROJECT_FACT',
        content: 'duplicate',
        provenance: 'test',
        confidence: 1,
        timestamp: '2026-08-30T20:05:00Z'
      }),
      /MEMORY_ID_EXISTS/
    );

    console.log(
      'CIWU_PERSISTENCE_RETRIEVAL_RECOVERY_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
