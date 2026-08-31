'use strict';

const {
  digest
} = require('./conversation-store-v1');

function verifyConversation(conversation) {
  if (
    !conversation ||
    !Array.isArray(conversation.messages)
  ) {
    return {
      ok: false,
      reason: 'INVALID_CONVERSATION'
    };
  }

  let previous = null;

  for (let i = 0; i < conversation.messages.length; i++) {
    const entry = conversation.messages[i];

    if (entry.seq !== i + 1) {
      return {
        ok: false,
        reason: 'SEQUENCE_BREAK',
        seq: entry.seq
      };
    }

    if (entry.previous_hash !== previous) {
      return {
        ok: false,
        reason: 'HASH_CHAIN_BREAK',
        seq: entry.seq
      };
    }

    const copy = {
      seq: entry.seq,
      role: entry.role,
      content: entry.content,
      timestamp: entry.timestamp,
      previous_hash: entry.previous_hash
    };

    if (digest(copy) !== entry.hash) {
      return {
        ok: false,
        reason: 'MESSAGE_HASH_MISMATCH',
        seq: entry.seq
      };
    }

    previous = entry.hash;
  }

  return {
    ok: true,
    messages: conversation.messages.length,
    final_hash: previous
  };
}

module.exports = {
  verifyConversation
};
