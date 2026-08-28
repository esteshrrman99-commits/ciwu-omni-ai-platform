'use strict';

const crypto=require('node:crypto');

const MAX_SECTIONS=24;
const MAX_TOTAL_CHARS=48000;
const MAX_SECTION_CHARS=8000;

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

function normalizeSection(section) {
  if (!section || typeof section!=='object') {
    throw new Error('CONTEXT_SECTION_INVALID');
  }

  const source=String(section.source || '').trim();
  const content=String(section.content || '');
  const relevance=Number(section.relevance ?? 0);

  if (!source || !content) {
    throw new Error('CONTEXT_SECTION_EMPTY');
  }

  if (content.length>MAX_SECTION_CHARS) {
    throw new Error('CONTEXT_SECTION_TOO_LARGE');
  }

  if (!Number.isFinite(relevance)) {
    throw new Error('CONTEXT_RELEVANCE_INVALID');
  }

  return {
    source,
    content,
    relevance,
    contentHash:hash(content)
  };
}

function compile({
  objective,
  sections=[]
}={}) {
  if (!Array.isArray(sections)) {
    throw new Error('CONTEXT_SECTIONS_INVALID');
  }

  const dedup=new Map();

  for (const raw of sections) {
    const section=normalizeSection(raw);

    if (!dedup.has(section.contentHash)) {
      dedup.set(section.contentHash,section);
    }
  }

  const ranked=[...dedup.values()]
    .sort((a,b)=>b.relevance-a.relevance);

  const admitted=[];
  let totalChars=0;

  for (const section of ranked) {
    if (admitted.length>=MAX_SECTIONS) break;

    if (totalChars+section.content.length>MAX_TOTAL_CHARS) {
      continue;
    }

    admitted.push(section);
    totalChars+=section.content.length;
  }

  return Object.freeze({
    schema:'CIWU_CORTEX_CONTEXT_COMPILER_V1',
    objective:String(objective || '').trim(),
    admittedCount:admitted.length,
    rejectedCount:ranked.length-admitted.length,
    totalChars,
    sections:admitted,
    contextHash:hash(JSON.stringify(admitted)),
    missingContext:
      sections.length>0 && admitted.length===0,
    provenanceRequired:true
  });
}

module.exports={
  MAX_SECTIONS,
  MAX_TOTAL_CHARS,
  MAX_SECTION_CHARS,
  hash,
  normalizeSection,
  compile
};
