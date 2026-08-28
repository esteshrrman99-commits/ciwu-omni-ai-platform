'use strict';

function build(provider={}) {
  const configured=
    provider.configured === true;

  const certified=
    provider.certified === true;

  const runtimeEligible=
    provider.runtimeEligible === true;

  const health=
    provider.health || 'UNKNOWN';

  const costClass=
    provider.costClass || 'UNKNOWN';

  const warnings=[];

  if (configured && !certified)
    warnings.push('CONFIGURED_NOT_CERTIFIED');

  if (costClass === 'UNKNOWN')
    warnings.push('UNKNOWN_COST');

  if (health !== 'HEALTHY')
    warnings.push('PROVIDER_NOT_HEALTHY');

  if (provider.revoked === true)
    warnings.push('REVOKED');

  return {
    provider:provider.provider || 'UNKNOWN',
    model:provider.model || 'UNKNOWN',
    configured,
    certified,
    runtimeEligible,
    health,
    costClass,
    evidenceFresh:
      provider.evidenceFresh === true,
    priceFresh:
      provider.priceFresh === true,
    circuitOpen:
      provider.circuitOpen === true,
    revoked:
      provider.revoked === true,
    warnings
  };
}

module.exports={build};
