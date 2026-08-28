'use strict';

function difference(a=[],b=[]) {
  const right=new Set(b);

  return a.filter(
    value=>!right.has(value)
  );
}

function detect({
  originalRoutes,
  currentRoutes,
  featureLedger,
  originalUi,
  currentUi
}={}) {
  const routeLoss=
    difference(
      originalRoutes?.classified?.internalRoutes || [],
      currentRoutes?.classified?.internalRoutes || []
    );

  const apiLoss=
    difference(
      originalRoutes?.classified?.apiRoutes || [],
      currentRoutes?.classified?.apiRoutes || []
    );

  const assetLoss=
    difference(
      [
        ...(originalUi?.images || []),
        ...(originalUi?.stylesheets || []),
        ...(originalUi?.scripts || [])
      ],
      [
        ...(currentUi?.images || []),
        ...(currentUi?.stylesheets || []),
        ...(currentUi?.scripts || [])
      ]
    );

  const lostFeatures=
    featureLedger?.lostOrHidden || [];

  return {
    schema:
      'CIWU_PLATFORM_DRIFT_DETECTOR_V1',
    routeLoss,
    apiLoss,
    assetLoss,
    lostFeatures,
    driftDetected:
      routeLoss.length>0 ||
      apiLoss.length>0 ||
      assetLoss.length>0 ||
      lostFeatures.length>0,
    interpretation:
      'DRIFT_IS_EVIDENCE_FOR_REVIEW_NOT_AUTOMATIC_RESTORE',
    automaticRestore:false
  };
}

module.exports={
  difference,
  detect
};
