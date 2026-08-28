'use strict';

const INTELLIGENCE_MODULES=Object.freeze([
  'M3',
  'CORTEX',
  'VORTEX',
  'ZORTEX',
  'CODE_INTELLIGENCE',
  'XEON',
  'NEUROTEX',
  'EONS',
  'PROJECT_BRAIN',
  'MODEL_FEDERATION'
]);

function build({
  originalFeatures=[],
  drift={}
}={}) {
  const mappings=[
    {
      productSurface:'PRIMARY_PRODUCT_UI',
      target:
        'ORIGINAL_PLATFORM_EXPERIENCE',
      role:'PUBLIC_OR_USER_FACING'
    },
    {
      productSurface:'AI_ASSISTANT',
      target:
        'M3+CORTEX+PROJECT_BRAIN',
      role:'CONVERSATIONAL_INTELLIGENCE'
    },
    {
      productSurface:'CODE_WORKSPACE',
      target:
        'CODE_INTELLIGENCE+XEON',
      role:'SOFTWARE_ENGINEERING'
    },
    {
      productSurface:'MEMORY',
      target:'NEUROTEX',
      role:'DURABLE_CONTEXT'
    },
    {
      productSurface:'EVIDENCE',
      target:'EONS',
      role:'PROVENANCE_AND_CERTIFICATION'
    },
    {
      productSurface:'ADMIN',
      target:
        'CURRENT_COMMAND_CENTER',
      role:'SOVEREIGN_OPERATOR_CONSOLE'
    }
  ];

  return {
    schema:
      'CIWU_SOVEREIGN_FUSION_MAPPER_V1',
    intelligenceModules:
      INTELLIGENCE_MODULES,
    mappings,
    originalFeatures,
    drift,
    principles:{
      restoreByEvidenceOnly:true,
      preserveCurrentIntelligence:true,
      preserveOriginalProductIdentity:true,
      adminShellSeparate:true,
      noAutomaticProductionMutation:true
    }
  };
}

module.exports={
  INTELLIGENCE_MODULES,
  build
};
