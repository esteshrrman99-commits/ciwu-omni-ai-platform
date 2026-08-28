'use strict';

const fs=require('node:fs');
const path=require('node:path');

const PROVIDERS=[
  {
    id:'openai',
    env:['OPENAI_API_KEY']
  },
  {
    id:'groq',
    env:['GROQ_API_KEY']
  },
  {
    id:'gemini',
    env:[
      'GEMINI_API_KEY',
      'GOOGLE_API_KEY'
    ]
  },
  {
    id:'cloudflare',
    env:[
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ACCOUNT_ID'
    ]
  },
  {
    id:'huggingface',
    env:[
      'HF_TOKEN',
      'HUGGINGFACE_API_KEY'
    ]
  }
];

function hasAny(keys=[]) {
  return keys.some(
    key =>
      typeof process.env[key] === 'string' &&
      process.env[key].length > 0
  );
}

function searchEvidence(root,provider) {
  const roots=[
    path.join(
      root,
      'data',
      'sovereign'
    )
  ];

  const names=[];

  for (const dir of roots) {
    if (!fs.existsSync(dir))
      continue;

    for (const name of fs.readdirSync(dir)) {
      const lower=
        name.toLowerCase();

      if (
        lower.includes(
          provider.toLowerCase()
        )
      ) {
        names.push(name);
      }
    }
  }

  return names.slice(0,25);
}

function truth(root=process.cwd()) {
  return {
    ok:true,
    configuredDoesNotEqualCertified:true,
    credentialsExposed:false,
    providers:
      PROVIDERS.map(provider => ({
        provider:provider.id,
        configured:
          hasAny(provider.env),
        credentialValueExposed:false,
        evidenceFiles:
          searchEvidence(
            root,
            provider.id
          ),
        certified:null,
        runtimeEligible:null,
        costClass:'UNKNOWN_UNLESS_EVIDENCE_PROVES_OTHERWISE'
      }))
  };
}

module.exports={
  PROVIDERS,
  hasAny,
  searchEvidence,
  truth
};
