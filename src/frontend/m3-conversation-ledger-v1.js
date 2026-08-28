'use strict';

const crypto=require('node:crypto');

function create({
  conversationId=crypto.randomUUID(),
  projectId=null
}={}) {
  const messages=[];

  function append({
    role,
    content,
    provider=null,
    model=null,
    responseId=null
  }) {
    if (!['user','assistant','system'].includes(role))
      throw new Error('INVALID_MESSAGE_ROLE');

    if (
      typeof content !== 'string' ||
      !content.trim()
    ) {
      throw new Error('MESSAGE_CONTENT_REQUIRED');
    }

    const message={
      sequence:messages.length+1,
      role,
      content,
      provider,
      model,
      responseId,
      createdAt:new Date().toISOString()
    };

    messages.push(message);

    return {...message};
  }

  function snapshot() {
    return {
      conversationId,
      projectId,
      messages:messages.map(x => ({...x}))
    };
  }

  return {
    append,
    snapshot
  };
}

module.exports={create};
