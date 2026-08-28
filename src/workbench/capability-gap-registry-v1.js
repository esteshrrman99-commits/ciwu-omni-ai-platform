'use strict';

const crypto=require('node:crypto');

const DEFAULT_GAPS=Object.freeze([
  {
    id:'reasoning_depth',
    domain:'intelligence',
    priority:1.00,
    target:'recursive planning and verification',
    status:'ACTIVE'
  },
  {
    id:'repo_understanding',
    domain:'intelligence',
    priority:0.98,
    target:'semantic project comprehension',
    status:'ACTIVE'
  },
  {
    id:'context_management',
    domain:'intelligence',
    priority:0.96,
    target:'bounded hierarchical context compilation',
    status:'ACTIVE'
  },
  {
    id:'self_critique',
    domain:'intelligence',
    priority:0.95,
    target:'critic and judge separation',
    status:'ACTIVE'
  },
  {
    id:'repair_iteration',
    domain:'autonomy',
    priority:0.94,
    target:'generate validate critique repair loop',
    status:'ACTIVE'
  },
  {
    id:'benchmark_truth',
    domain:'evidence',
    priority:1.00,
    target:'measured capability comparison',
    status:'ACTIVE'
  },
  {
    id:'uncertainty_calibration',
    domain:'evidence',
    priority:0.97,
    target:'confidence separated from truth',
    status:'ACTIVE'
  },
  {
    id:'authorization_separation',
    domain:'safety',
    priority:1.00,
    target:'optimization separated from authorization',
    status:'ENFORCED'
  }
]);

function canonical(value) {
  if (value===null || typeof value!=='object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '['+value.map(canonical).join(',')+']';
  }

  return '{'+Object.keys(value).sort().map(
    key=>JSON.stringify(key)+':'+canonical(value[key])
  ).join(',')+'}';
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value==='string'
        ? value
        : canonical(value)
    )
    .digest('hex');
}

function rank(gaps=DEFAULT_GAPS) {
  if (!Array.isArray(gaps)) {
    throw new Error('CAPABILITY_GAPS_INVALID');
  }

  return gaps
    .map(gap=>({
      ...gap,
      priority:Number(gap.priority || 0)
    }))
    .sort((a,b)=>b.priority-a.priority);
}

function snapshot(gaps=DEFAULT_GAPS) {
  const ranked=rank(gaps);

  return Object.freeze({
    schema:'CIWU_CAPABILITY_GAP_REGISTRY_V1',
    count:ranked.length,
    gaps:ranked,
    registryHash:sha256(ranked),
    universalSuperiorityClaim:false,
    benchmarkEvidenceRequired:true,
    confidenceIsTruth:false,
    optimizationIsAuthorization:false
  });
}

module.exports={
  DEFAULT_GAPS,
  canonical,
  sha256,
  rank,
  snapshot
};
