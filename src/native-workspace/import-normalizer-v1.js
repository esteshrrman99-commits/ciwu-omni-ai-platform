'use strict';

const crypto =
  require('node:crypto');

const {
  inertImportedMessage
} = require(
  './import-authority-boundary-v1'
);

const MAX_CONVERSATIONS = 10000;
const MAX_MESSAGES = 500000;
const MAX_CONTENT_BYTES =
  1024 * 1024;

const ALLOWED_ROLES =
  new Set([
    'system',
    'user',
    'assistant',
    'tool'
  ]);

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      Buffer.isBuffer(value)
        ? value
        : String(value)
    )
    .digest('hex');
}

function safeText(value) {
  if (value == null) {
    return '';
  }

  if (
    typeof value === 'string'
  ) {
    return value;
  }

  return JSON.stringify(value);
}

function extractContent(message) {
  if (!message) {
    return '';
  }

  if (
    typeof message.content ===
      'string'
  ) {
    return message.content;
  }

  const content =
    message.content;

  if (
    content &&
    Array.isArray(
      content.parts
    )
  ) {
    return content.parts
      .map(safeText)
      .join('\n');
  }

  if (
    content &&
    typeof content.text ===
      'string'
  ) {
    return content.text;
  }

  return safeText(content);
}

function normalizeRole(role) {
  const value =
    String(role || 'user')
      .toLowerCase();

  return ALLOWED_ROLES.has(value)
    ? value
    : 'user';
}

function normalizeMessage(
  message,
  provenance
) {
  const text =
    extractContent(message);

  if (
    Buffer.byteLength(
      text,
      'utf8'
    ) >
    MAX_CONTENT_BYTES
  ) {
    throw new Error(
      'IMPORT_MESSAGE_TOO_LARGE'
    );
  }

  const externalId =
    message.id ||
    provenance.external_message_id ||
    null;

  const normalized = {
    id:
      externalId
        ? String(externalId)
        : sha256(
            JSON.stringify({
              role:
                normalizeRole(
                  message.role
                ),
              content:text,
              ordinal:
                provenance.ordinal
            })
          ).slice(0, 32),
    role:
      normalizeRole(
        message.role
      ),
    content:text,
    created_at:
      message.create_time ||
      message.created_at ||
      message.timestamp ||
      null,
    provenance:{
      source_sha256:
        provenance.source_sha256,
      source_type:
        provenance.source_type,
      external_conversation_id:
        provenance.external_conversation_id,
      external_message_id:
        externalId
          ? String(externalId)
          : null,
      ordinal:
        provenance.ordinal
    }
  };

  return inertImportedMessage(
    normalized
  );
}

function flattenMapping(
  conversation,
  sourceSha
) {
  const mapping =
    conversation.mapping || {};

  const rows = [];

  for (
    const [nodeId, node] of
    Object.entries(mapping)
  ) {
    if (
      !node ||
      !node.message
    ) {
      continue;
    }

    rows.push({
      node_id:nodeId,
      parent:
        node.parent || null,
      message:
        node.message
    });
  }

  rows.sort((a,b) => {
    const ta =
      Number(
        a.message.create_time || 0
      );

    const tb =
      Number(
        b.message.create_time || 0
      );

    if (ta !== tb) {
      return ta - tb;
    }

    return String(a.node_id)
      .localeCompare(
        String(b.node_id)
      );
  });

  return rows.map(
    (row,index) =>
      normalizeMessage(
        {
          ...row.message,
          id:
            row.message.id ||
            row.node_id,
          role:
            row.message.author &&
            row.message.author.role
              ? row.message.author.role
              : row.message.role
        },
        {
          source_sha256:
            sourceSha,
          source_type:
            'CHATGPT_EXPORT_MAPPING',
          external_conversation_id:
            conversation.id ||
            conversation.conversation_id ||
            null,
          external_message_id:
            row.node_id,
          ordinal:index
        }
      )
  );
}

function flatMessages(
  conversation,
  sourceSha
) {
  const list =
    Array.isArray(
      conversation.messages
    )
      ? conversation.messages
      : [];

  return list.map(
    (message,index) =>
      normalizeMessage(
        {
          ...message,
          role:
            message.role ||
            (
              message.author &&
              message.author.role
            )
        },
        {
          source_sha256:
            sourceSha,
          source_type:
            'FLAT_CONVERSATION_JSON',
          external_conversation_id:
            conversation.id ||
            conversation.conversation_id ||
            null,
          external_message_id:
            message.id || null,
          ordinal:index
        }
      )
  );
}

function normalizeConversation(
  conversation,
  sourceSha,
  index
) {
  const messages =
    conversation.mapping
      ? flattenMapping(
          conversation,
          sourceSha
        )
      : flatMessages(
          conversation,
          sourceSha
        );

  return {
    external_id:
      conversation.id ||
      conversation.conversation_id ||
      `conversation-${index}`,
    title:
      String(
        conversation.title ||
        `Imported Conversation ${index + 1}`
      ).slice(0, 500),
    created_at:
      conversation.create_time ||
      conversation.created_at ||
      null,
    updated_at:
      conversation.update_time ||
      conversation.updated_at ||
      null,
    messages
  };
}

function normalizeImport(
  payload,
  metadata = {}
) {
  const raw =
    JSON.stringify(payload);

  const sourceSha =
    sha256(raw);

  let conversations;

  if (Array.isArray(payload)) {
    conversations = payload;
  } else if (
    payload &&
    Array.isArray(
      payload.conversations
    )
  ) {
    conversations =
      payload.conversations;
  } else if (
    payload &&
    Array.isArray(
      payload.messages
    )
  ) {
    conversations = [
      {
        id:
          payload.id ||
          'single-conversation',
        title:
          payload.title ||
          'Imported Conversation',
        messages:
          payload.messages
      }
    ];
  } else {
    throw new Error(
      'IMPORT_FORMAT_UNSUPPORTED'
    );
  }

  if (
    conversations.length >
    MAX_CONVERSATIONS
  ) {
    throw new Error(
      'IMPORT_TOO_MANY_CONVERSATIONS'
    );
  }

  const normalized =
    conversations.map(
      (conversation,index) =>
        normalizeConversation(
          conversation,
          sourceSha,
          index
        )
    );

  const messageCount =
    normalized.reduce(
      (sum,row) =>
        sum +
        row.messages.length,
      0
    );

  if (
    messageCount >
    MAX_MESSAGES
  ) {
    throw new Error(
      'IMPORT_TOO_MANY_MESSAGES'
    );
  }

  return {
    version:1,
    source_sha256:
      sourceSha,
    source_name:
      String(
        metadata.source_name ||
        'conversation-import.json'
      ).slice(0, 500),
    source_format:
      normalized.some(
        row =>
          row.messages.some(
            msg =>
              msg.provenance
                .source_type ===
              'CHATGPT_EXPORT_MAPPING'
          )
      )
        ? 'CHATGPT_EXPORT_JSON'
        : 'GENERIC_CONVERSATION_JSON',
    conversation_count:
      normalized.length,
    message_count:
      messageCount,
    conversations:
      normalized
  };
}

module.exports = {
  normalizeImport,
  normalizeMessage,
  sha256
};
