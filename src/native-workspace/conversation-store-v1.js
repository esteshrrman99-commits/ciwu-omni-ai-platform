'use strict';

const path = require('node:path');
const crypto = require('node:crypto');

const {
  ensureDir,
  readJson,
  atomicWriteJson
} = require('./atomic-store-v1');

const ROLES = new Set([
  'system',
  'user',
  'assistant',
  'tool'
]);

function safeId(value) {
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9._-]{1,128}$/.test(value)
  ) {
    throw new Error('INVALID_IDENTIFIER');
  }

  return value;
}

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

class ConversationStore {
  constructor(root) {
    this.root = path.resolve(root);
    ensureDir(this.root);
  }

  file(projectId, conversationId) {
    return path.join(
      this.root,
      safeId(projectId),
      safeId(conversationId) + '.json'
    );
  }

  create(projectId, conversationId, now) {
    const file = this.file(projectId, conversationId);

    if (readJson(file, null) !== null) {
      throw new Error('CONVERSATION_EXISTS');
    }

    const conversation = {
      schema: 'CIWU_NATIVE_CONVERSATION_V1',
      project_id: safeId(projectId),
      conversation_id: safeId(conversationId),
      created_at: now,
      updated_at: now,
      revision: 0,
      messages: []
    };

    atomicWriteJson(file, conversation);
    return conversation;
  }

  get(projectId, conversationId) {
    return readJson(
      this.file(projectId, conversationId),
      null
    );
  }

  append(projectId, conversationId, message, now) {
    if (
      !message ||
      !ROLES.has(message.role) ||
      typeof message.content !== 'string'
    ) {
      throw new Error('INVALID_MESSAGE');
    }

    const file = this.file(projectId, conversationId);
    const conversation = readJson(file, null);

    if (!conversation) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const previous =
      conversation.messages.length === 0
        ? null
        : conversation.messages[
            conversation.messages.length - 1
          ].hash;

    const entry = {
      seq: conversation.messages.length + 1,
      role: message.role,
      content: message.content,
      timestamp: now,
      previous_hash: previous
    };

    entry.hash = digest(entry);

    conversation.messages.push(entry);
    conversation.revision += 1;
    conversation.updated_at = now;

    atomicWriteJson(file, conversation);
    return entry;
  }
}

module.exports = {
  ConversationStore,
  safeId,
  digest
};
