'use strict';

const FEATURE_RULES=Object.freeze([
  ['chatbot',/chat|assistant|conversation|message/i],
  ['coding',/code|repository|debug|patch|developer/i],
  ['project_management',/project|workspace|task/i],
  ['supplier',/supplier|wholesale|vendor|procurement/i],
  ['commerce',/product|cart|checkout|order|payment/i],
  ['entity_data',/entity|entities|directory/i],
  ['research',/research|search|source|evidence/i],
  ['dashboard',/dashboard|overview|metric/i],
  ['authentication',/login|sign in|account|auth/i],
  ['api',/\/api\//i],
  ['upload',/upload|file|attachment/i],
  ['memory',/memory|history|knowledge/i]
]);

function detect(content='') {
  return FEATURE_RULES.map(
    ([id,pattern])=>({
      id,
      detected:
        pattern.test(content)
    })
  );
}

function ledger({
  originalContent='',
  currentContent=''
}={}) {
  const original=
    detect(originalContent);

  const current=
    detect(currentContent);

  const byId=
    new Map(
      current.map(item=>[
        item.id,
        item
      ])
    );

  const comparison=
    original.map(item=>{
      const now=
        byId.get(item.id);

      const status=
        item.detected &&
        now?.detected
          ? 'SURVIVED'
          : item.detected &&
            !now?.detected
            ? 'POSSIBLY_LOST_OR_HIDDEN'
            : !item.detected &&
              now?.detected
              ? 'NEW'
              : 'ABSENT';

      return {
        id:item.id,
        original:
          item.detected,
        current:
          Boolean(now?.detected),
        status
      };
    });

  return {
    schema:
      'CIWU_ORIGINAL_FEATURE_LEDGER_V1',
    comparison,
    lostOrHidden:
      comparison
        .filter(item=>
          item.status==='POSSIBLY_LOST_OR_HIDDEN'
        )
        .map(item=>item.id),
    newFeatures:
      comparison
        .filter(item=>
          item.status==='NEW'
        )
        .map(item=>item.id),
    mutationPerformed:false
  };
}

module.exports={
  FEATURE_RULES,
  detect,
  ledger
};
