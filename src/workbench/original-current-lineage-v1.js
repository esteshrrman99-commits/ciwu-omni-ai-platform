'use strict';

function map({
  originalFeatures,
  originalRoutes,
  originalUi,
  currentFeatures,
  currentRoutes,
  currentUi
}={}) {
  const nodes=[
    {
      id:'ORIGINAL_PLATFORM',
      type:'historical_product'
    },
    {
      id:'CURRENT_COMMAND_CENTER',
      type:'current_admin_shell'
    },
    {
      id:'TARGET_UNIFIED_PLATFORM',
      type:'fusion_target'
    }
  ];

  const edges=[
    {
      from:'ORIGINAL_PLATFORM',
      to:'TARGET_UNIFIED_PLATFORM',
      relation:
        'PRESERVE_PRODUCT_EXPERIENCE'
    },
    {
      from:'CURRENT_COMMAND_CENTER',
      to:'TARGET_UNIFIED_PLATFORM',
      relation:
        'PRESERVE_AS_SOVEREIGN_ADMIN'
    }
  ];

  return {
    schema:
      'CIWU_ORIGINAL_CURRENT_LINEAGE_V1',
    nodes,
    edges,
    original:{
      features:originalFeatures,
      routes:originalRoutes,
      ui:originalUi
    },
    current:{
      features:currentFeatures,
      routes:currentRoutes,
      ui:currentUi
    },
    doctrine:{
      replaceOriginalPlatform:false,
      deleteCommandCenter:false,
      fusionRequired:true,
      originalProductPrimary:true,
      commandCenterAdminOnly:true
    }
  };
}

module.exports={
  map
};
