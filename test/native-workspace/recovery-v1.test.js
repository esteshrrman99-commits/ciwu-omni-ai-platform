'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ConversationStore
} = require('../../src/native-workspace/conversation-store-v1');

const {
  verifyConversation
} = require('../../src/native-workspace/recovery-v1');

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('conversation tampering fails closed', () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ciwu-recovery-')
  );

  try {
    const store = new ConversationStore(root);

    store.create(
      'p1',
      'c1',
      '2026-08-30T20:00:00Z'
    );

    store.append(
      'p1',
      'c1',
      {
        role: 'user',
        content: 'original'
      },
      '2026-08-30T20:01:00Z'
    );

    const conversation = store.get('p1', 'c1');

    assert.equal(
      verifyConversation(conversation).ok,
      true
    );

    conversation.messages[0].content = 'tampered';

    const result = verifyConversation(conversation);

    assert.equal(result.ok, false);
    assert.equal(
      result.reason,
      'MESSAGE_HASH_MISMATCH'
    );

    console.log(
      'CIWU_CONVERSATION_TAMPER_FAIL_CLOSED_PASS'
    );
  } finally {
    fs.rmSync(root, {
      recursive: true,
      force: true
    });
  }
});
